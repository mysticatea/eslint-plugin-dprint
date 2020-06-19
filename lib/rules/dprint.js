"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dprint = void 0;
const path_1 = __importDefault(require("path"));
const difference_iterator_1 = require("../util/difference-iterator");
const config_schema_json_1 = __importDefault(require("../dprint/config-schema.json"));
const typescript_1 = require("../dprint/typescript");
const predicate_1 = require("../util/predicate");
const rule_1 = require("../util/rule");
/**
 * Count line breaks in the head whitespace sequence.
 * @param s The text to check.
 */
function getLineNumberOfFirstCode(s) {
    const m = /^\s+/u.exec(s);
    if (!m) {
        return 0;
    }
    const Linebreak = /\r\n|[\r\n]/gu;
    let count = 0;
    while (Linebreak.exec(m[0]) != null) {
        count += 1;
    }
    return count;
}
/**
 * Create the report message of a given difference.
 * @param d The difference object to create message.
 */
function createMessage(d) {
    if (d.type === "add") {
        if (predicate_1.isWhitespace(d.newText)) {
            return {
                messageId: predicate_1.hasLinebreak(d.newText)
                    ? "requireLinebreak"
                    : "requireWhitespace",
                data: {},
            };
        }
        return {
            messageId: "requireCode",
            data: { text: JSON.stringify(d.newText.trim()) },
        };
    }
    if (d.type === "remove") {
        if (predicate_1.isWhitespace(d.oldText)) {
            return {
                messageId: predicate_1.hasLinebreak(d.oldText)
                    ? "extraLinebreak"
                    : "extraWhitespace",
                data: {},
            };
        }
        return {
            messageId: "extraCode",
            data: { text: JSON.stringify(d.oldText.trim()) },
        };
    }
    if (predicate_1.isWhitespace(d.oldText) && predicate_1.isWhitespace(d.newText)) {
        const oldHasLinebreak = predicate_1.hasLinebreak(d.oldText);
        const newHasLinebreak = predicate_1.hasLinebreak(d.newText);
        return {
            messageId: !oldHasLinebreak && newHasLinebreak
                ? "requireLinebreak"
                : oldHasLinebreak && !newHasLinebreak
                    ? "extraLinebreak"
                    : "replaceWhitespace",
            data: {},
        };
    }
    if (d.oldText.trim() === d.newText.trim()) {
        const oldLine = getLineNumberOfFirstCode(d.oldText);
        const newLine = getLineNumberOfFirstCode(d.newText);
        return {
            messageId: newLine > oldLine
                ? "moveCodeToNextLine"
                : newLine < oldLine
                    ? "moveCodeToPrevLine"
                    : "moveCode",
            data: { text: JSON.stringify(d.oldText.trim()) },
        };
    }
    return {
        messageId: "replaceCode",
        data: {
            newText: JSON.stringify(d.newText.trim()),
            oldText: JSON.stringify(d.oldText.trim()),
        },
    };
}
exports.dprint = rule_1.rule({
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
            definitions: config_schema_json_1.default.definitions,
            type: "array",
            items: [{
                    type: "object",
                    properties: { config: config_schema_json_1.default },
                    additionalProperties: false,
                }],
            additionalItems: false,
        },
        type: "layout",
    },
    defaultOptions: [{ config: {} }],
    create: (context, options) => ({
        Program() {
            const sourceCode = context.getSourceCode();
            const filePath = context.getFilename();
            const fileText = sourceCode.getText();
            const config = options[0].config || {};
            // Needs an absolute path
            if (!filePath || !path_1.default.isAbsolute(filePath)) {
                return;
            }
            // Does format
            const formattedText = typescript_1.format(config, filePath, fileText);
            if (typeof formattedText !== "string") {
                return;
            }
            // Generate lint reports
            for (const d of difference_iterator_1.DifferenceIterator.iterate(fileText, formattedText)) {
                const loc = d.type === "add"
                    ? sourceCode.getLocFromIndex(d.range[0])
                    : {
                        start: sourceCode.getLocFromIndex(d.range[0]),
                        end: sourceCode.getLocFromIndex(d.range[1]),
                    };
                const { messageId, data } = createMessage(d);
                context.report({
                    loc,
                    messageId,
                    data,
                    fix(fixer) {
                        const range = d.range;
                        if (d.type === "add") {
                            return fixer.insertTextAfterRange(range, d.newText);
                        }
                        if (d.type === "remove") {
                            return fixer.removeRange(range);
                        }
                        return fixer.replaceTextRange(range, d.newText);
                    },
                });
            }
        },
    }),
});
//# sourceMappingURL=dprint.js.map