import path from "path"
import { TSESLint } from "@typescript-eslint/experimental-utils"
import { Diff, DifferenceIterator } from "../util/difference-iterator"
import { loadDprint } from "../util/dprint"
import { hasLinebreak, isWhitespace } from "../util/predicate"
import { rule } from "../util/rule"

/** The message IDs. */
type MessageId = (typeof dprint) extends TSESLint.RuleModule<infer T, any, any>
    ? T
    : never
/** The message. */
type Message = {
    messageId: MessageId
    data: Record<string, string>
}

/** The `environment` option value that is noop for dprint. */
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

/**
 * Count line breaks in the head whitespace sequence.
 * @param s The text to check.
 */
function getLineNumberOfFirstCode(s: string): number {
    const m = /^\s+/u.exec(s)
    if (!m) {
        return 0
    }

    const Linebreak = /\r\n|[\r\n]/gu
    let count = 0
    while (Linebreak.exec(m[0]) != null) {
        count += 1
    }

    return count
}

/**
 * Create the report message of a given difference.
 * @param d The difference object to create message.
 */
function createMessage(d: Diff): Message {
    if (d.type === "add") {
        if (isWhitespace(d.newText)) {
            return {
                messageId: hasLinebreak(d.newText)
                    ? "requireLinebreak"
                    : "requireWhitespace",
                data: {},
            }
        }
        return {
            messageId: "requireCode",
            data: { text: JSON.stringify(d.newText.trim()) },
        }
    }

    if (d.type === "remove") {
        if (isWhitespace(d.oldText)) {
            return {
                messageId: hasLinebreak(d.oldText)
                    ? "extraLinebreak"
                    : "extraWhitespace",
                data: {},
            }
        }
        return {
            messageId: "extraCode",
            data: { text: JSON.stringify(d.oldText.trim()) },
        }
    }

    if (isWhitespace(d.oldText) && isWhitespace(d.newText)) {
        const oldHasLinebreak = hasLinebreak(d.oldText)
        const newHasLinebreak = hasLinebreak(d.newText)
        return {
            messageId: !oldHasLinebreak && newHasLinebreak
                ? "requireLinebreak"
                : oldHasLinebreak && !newHasLinebreak
                ? "extraLinebreak"
                : "replaceWhitespace",
            data: {},
        }
    }

    if (d.oldText.trim() === d.newText.trim()) {
        const oldLine = getLineNumberOfFirstCode(d.oldText)
        const newLine = getLineNumberOfFirstCode(d.newText)
        return {
            messageId: newLine > oldLine
                ? "moveCodeToNextLine"
                : newLine < oldLine
                ? "moveCodeToPrevLine"
                : "moveCode",
            data: { text: JSON.stringify(d.oldText.trim()) },
        }
    }

    return {
        messageId: "replaceCode",
        data: {
            newText: JSON.stringify(d.newText.trim()),
            oldText: JSON.stringify(d.oldText.trim()),
        },
    }
}

export const dprint = rule({
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
            moveCodeToNextLine: "Move code {{text}} to the next line.",
            moveCodeToPrevLine: "Move code {{text}} to the previous line.",
            moveCode: "Require tweaking whitespaces around code {{text}}.",
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
            for (const d of DifferenceIterator.iterate(
                fileText,
                formattedText,
            )) {
                const loc = d.type === "add"
                    ? sourceCode.getLocFromIndex(d.range[0])
                    : {
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
                        if (d.type === "add") {
                            return fixer.insertTextAfterRange(range, d.newText)
                        }
                        if (d.type === "remove") {
                            return fixer.removeRange(range)
                        }
                        return fixer.replaceTextRange(range, d.newText)
                    },
                })
            }
        },
    }),
})

// For --rulesdir of this repo
Object.assign(module.exports, dprint)
