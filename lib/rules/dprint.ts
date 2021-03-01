import { TSESLint } from "@typescript-eslint/experimental-utils"
import path from "path"
import configSchema from "../dprint/config-schema.json"
import { format } from "../dprint/typescript"
import { Diff, DifferenceIterator } from "../util/difference-iterator"
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
            description: "Format code with dprint",
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
        schema: {
            definitions: configSchema.definitions as any,
            type: "array",
            items: [{
                type: "object",
                properties: { config: configSchema },
                additionalProperties: false,
            }],
            additionalItems: false,
        },
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

            // Does format
            const formattedText = format(config, filePath, fileText)
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
