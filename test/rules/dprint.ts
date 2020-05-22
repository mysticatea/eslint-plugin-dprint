import path from "path"
import { TSESLint } from "@typescript-eslint/experimental-utils"
import { dprint } from "../../lib/rules/dprint"

const tester = new TSESLint.RuleTester()
tester.run(
    "dprint",
    dprint,
    {
        valid: [
            {
                filename: path.join(__dirname, "test.ts"),
                code: 'console.log("hello!");\n',
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
        ],
    },
)
