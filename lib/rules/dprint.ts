import path from "path"
import { diffChars } from "diff"
import { loadDprint } from "../util/dprint"
import { rule } from "../util/rule"

type Diff = {
    type: "added"
    range: readonly [number, number]
    newText: string
    oldText: undefined
} | {
    type: "removed"
    range: readonly [number, number]
    newText: undefined
    oldText: string
} | {
    type: "replaced"
    range: readonly [number, number]
    newText: string
    oldText: string
}
type MessageId =
    | "requireLinebreak"
    | "extraLinebreak"
    | "requireWhitespace"
    | "extraWhitespace"
    | "requireCode"
    | "extraCode"
    | "replaceWhitespace"
    | "replaceCode"

const environment: import("@dprint/core").CliLoggingEnvironment = {
    log() {
        // Do nothing.
    },
    warn() {
        // Do nothing.
    },
    error() {
        // Do nothing.
    },
}

function* diff(s0: string, s1: string): Generator<Diff> {
    const changes = diffChars(s0, s1)
    const lastIndex = changes.length - 1

    let index = 0
    let cursor = 0
    while (index <= lastIndex) {
        const { added, removed, value: text } = changes[index]

        if (added) {
            const next = index + 1 <= lastIndex ? changes[index + 1] : undefined
            if (next && next.removed) {
                // Handle it as replaced.
                const range = [cursor, cursor + next.value.length] as const
                index += 2
                cursor += next.value.length
                yield {
                    range,
                    newText: text,
                    oldText: next.value,
                    type: "replaced",
                }
            } else {
                // Handle it as added.
                const range = [cursor, cursor] as const
                index += 1
                yield {
                    range,
                    newText: text,
                    oldText: undefined,
                    type: "added",
                }
            }
        } else if (removed) {
            const next = index + 1 <= lastIndex ? changes[index + 1] : undefined
            if (next && next.added) {
                // Handle it as replaced.
                const range = [cursor, cursor + text.length] as const
                index += 2
                cursor += text.length
                yield {
                    range,
                    newText: next.value,
                    oldText: text,
                    type: "replaced",
                }
            } else {
                // Handle it as removed.
                const range = [cursor, cursor + text.length] as const
                index += 1
                cursor += text.length
                yield {
                    range,
                    newText: undefined,
                    oldText: text,
                    type: "removed",
                }
            }
        } else {
            // Ignore it as not-changed.
            index += 1
            cursor += text.length
        }
    }
}

function createMessage(d: Diff): { messageId: MessageId; data: any } {
    if (d.type === "added") {
        if (/^\s+$/u.test(d.newText)) {
            if (/[\r\n]/u.test(d.newText)) {
                return { messageId: "requireLinebreak", data: {} }
            }
            return { messageId: "requireWhitespace", data: {} }
        }
        return {
            messageId: "requireCode",
            data: { text: JSON.stringify(d.newText.trim()) },
        }
    } else if (d.type === "removed") {
        if (/^\s+$/u.test(d.oldText)) {
            if (/[\r\n]/u.test(d.oldText)) {
                return { messageId: "extraLinebreak", data: {} }
            }
            return { messageId: "extraWhitespace", data: {} }
        }
        return {
            messageId: "extraCode",
            data: { text: JSON.stringify(d.oldText.trim()) },
        }
    }

    const oldIsWhitespace = /^\s+$/u.test(d.oldText)
    const newIsWhitespace = /^\s+$/u.test(d.newText)
    if (oldIsWhitespace && newIsWhitespace) {
        const oldHasLinebreaks = /[\r\n]/u.test(d.oldText)
        const newHasLinebreaks = /[\r\n]/u.test(d.newText)
        if (!oldHasLinebreaks && newHasLinebreaks) {
            return { messageId: "requireLinebreak", data: {} }
        }
        if (oldHasLinebreaks && !newHasLinebreaks) {
            return { messageId: "extraLinebreak", data: {} }
        }
        return { messageId: "replaceWhitespace", data: {} }
    }
    return {
        messageId: "replaceCode",
        data: {
            newText: newIsWhitespace ?
                "whitespace(s)" :
                JSON.stringify(d.newText.trim()),
            oldText: oldIsWhitespace ?
                "whitespace(s)" :
                JSON.stringify(d.oldText.trim()),
        },
    }
}

export const dprint = rule(
    {
        name: "dprint",
        meta: {
            docs: {
                category: "Stylistic Issues",
                description: "Run dprint",
                recommended: "error",
            },
            fixable: "code",
            messages: {
                requireLinebreak: "Require line break(s).",
                extraLinebreak: "Extra line break(s).",
                requireWhitespace: "Require whitespace(s).",
                extraWhitespace: "Extra whitespace(s).",
                requireCode: "Require code {{text}}.",
                extraCode: "Extra code {{text}}.",
                replaceWhitespace: "Require tweaking whitespace(s).",
                replaceCode: "Require code {{newText}} instead of {{oldText}}.",
            },
            schema: [
                {
                    type: "object",
                    properties: { config: { type: "object" } },
                    additionalProperties: false,
                    required: ["config"],
                },
            ],
            type: "layout",
        },
        defaultOptions: [{ config: {} }],

        create: (context, options) => ({
            Program() {
                const sourceCode = context.getSourceCode()
                const filePath = context.getFilename()
                const fileText = sourceCode.getText()
                const config = (options[0] as any).config || {}

                // Needs an absolute path
                if (!filePath || !path.isAbsolute(filePath)) {
                    return
                }

                // Load dprint
                const {
                    TypeScriptPlugin,
                    formatFileText,
                    resolveConfiguration,
                } = loadDprint(filePath)

                // Does format
                const globalConfig = resolveConfiguration({}).config
                const tsPlugin = new TypeScriptPlugin(config)
                tsPlugin.initialize({ environment, globalConfig })
                const formattedText = formatFileText({
                    filePath,
                    fileText,
                    plugins: [tsPlugin],
                })
                if (typeof formattedText !== "string") {
                    return
                }

                // Generate lint reports
                for (const d of diff(fileText, formattedText)) {
                    const loc = d.type === "added" ?
                        sourceCode.getLocFromIndex(d.range[0]) :
                        {
                            start: sourceCode.getLocFromIndex(d.range[0]),
                            end: sourceCode.getLocFromIndex(d.range[1]),
                        }
                    const { messageId, data } = createMessage(d)

                    context.report({
                        loc,
                        messageId,
                        data,

                        fix(fixer) {
                            const range = d.range as [number, number]
                            if (d.type === "added") {
                                return fixer.insertTextAfterRange(
                                    range,
                                    d.newText,
                                )
                            }
                            if (d.type === "removed") {
                                return fixer.removeRange(range)
                            }
                            return fixer.replaceTextRange(range, d.newText)
                        },
                    })
                }
            },
        }),
    },
)

// For --rulesdir of this repo
Object.assign(module.exports, dprint)
