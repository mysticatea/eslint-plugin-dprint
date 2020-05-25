import path from "path"
import { TSESLint } from "@typescript-eslint/experimental-utils"
import { dprint } from "../../lib/rules/dprint"

const tester = new TSESLint.RuleTester()
tester.run("dprint", dprint, {
    valid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: 'console.log("hello!");\n',
        }, // Non JS/TS file
        {
            filename: path.join(__dirname, "test.json"),
            code: "",
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: "console . log('hello!')",
            output: 'console.log("hello!");\n',
            errors: [
                {
                    messageId: "extraWhitespace",
                    data: {},
                    column: 8,
                    endColumn: 9,
                },
                {
                    messageId: "extraWhitespace",
                    data: {},
                    column: 10,
                    endColumn: 11,
                },
                {
                    messageId: "replaceCode",
                    data: { newText: '"\\""', oldText: '"\'"' },
                    column: 15,
                    endColumn: 16,
                },
                {
                    messageId: "replaceCode",
                    data: { newText: '"\\""', oldText: '"\'"' },
                    column: 22,
                    endColumn: 23,
                },
                {
                    messageId: "requireCode",
                    data: { text: '";"' },
                    column: 24,
                    endColumn: undefined,
                },
            ],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code:
                'type TypeScriptPlugin = typeof import("dprint-plugin-typescript").TypeScriptPlugin;\n',
            output:
                'type TypeScriptPlugin =\n    typeof import("dprint-plugin-typescript").TypeScriptPlugin;\n',
            options: [{ config: { lineWidth: 80 } }],
            errors: [{
                messageId: "requireLinebreak",
                data: {},
                column: 24,
                endColumn: 25,
            }],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code:
                'type TFormatFileText =\n    typeof import("@dprint/core").formatText;\n',
            output:
                'type TFormatFileText = typeof import("@dprint/core").formatText;\n',
            options: [{ config: { lineWidth: 80 } }],
            errors: [{
                messageId: "extraLinebreak",
                data: {},
                line: 1,
                column: 23,
                endLine: 2,
                endColumn: 5,
            }],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: `const loc = d.type === "added" ?
    sourceCode.getLocFromIndex(d.range[0]) :
    {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            output: `const loc = d.type === "added"
    ? sourceCode.getLocFromIndex(d.range[0])
    : {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            options: [{ config: { lineWidth: 80 } }],
            errors: [
                {
                    messageId: "moveCodeToNextLine",
                    data: { text: '"?"' },
                    line: 1,
                    column: 31,
                    endLine: 2,
                    endColumn: 5,
                },
                {
                    messageId: "moveCodeToNextLine",
                    data: { text: '":"' },
                    line: 2,
                    column: 43,
                    endLine: 3,
                    endColumn: 5,
                },
            ],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: `const loc = d.type === "added"
    ? sourceCode.getLocFromIndex(d.range[0])
    : {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            output: `const loc = d.type === "added" ?
    sourceCode.getLocFromIndex(d.range[0]) :
    {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            options: [{
                config: { lineWidth: 80, operatorPosition: "sameLine" },
            }],
            errors: [
                {
                    messageId: "moveCodeToPrevLine",
                    data: { text: '"?"' },
                    line: 1,
                    column: 31,
                    endLine: 2,
                    endColumn: 7,
                },
                {
                    messageId: "moveCodeToPrevLine",
                    data: { text: '":"' },
                    line: 2,
                    column: 45,
                    endLine: 3,
                    endColumn: 7,
                },
            ],
        },
    ],
})
