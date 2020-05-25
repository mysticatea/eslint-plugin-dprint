"use strict"

module.exports = {
    extends: ["plugin:@mysticatea/es2020", "plugin:@mysticatea/+node"],
    ignorePatterns: ["/.nyc_output", "/coverage", "/dist"],
    rules: {
        // Buggy.
        "require-atomic-updates": "off",
        "@mysticatea/ts/restrict-plus-operands": "off",

        // Use self.
        dprint: ["error", {
            config: {
                lineWidth: 80,
                semiColons: "asi",
                quoteStyle: "preferDouble",
                singleBodyPosition: "sameLine",
                nextControlFlowPosition: "sameLine",
                "arrowFunction.useParentheses": "preferNone",
                "taggedTemplate.spaceBeforeLiteral": false,

                // operatorPosition
                operatorPosition: "sameLine",
                "conditionalExpression.operatorPosition": "nextLine",

                // preferHanging
                "forInStatement.preferHanging": true,
                "forOfStatement.preferHanging": true,

                // preferSingleLine
                "arguments.preferSingleLine": true,
                "binaryExpression.preferSingleLine": true,
                "exportDeclaration.preferSingleLine": true,
                "importDeclaration.preferSingleLine": true,
                "parameters.preferSingleLine": true,

                // linePerExpression
                "binaryExpression.linePerExpression": true,
                "memberExpression.linePerExpression": true,
            },
        }],
        "@mysticatea/prettier": "off",
    },
}
