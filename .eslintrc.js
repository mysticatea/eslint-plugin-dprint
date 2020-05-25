"use strict"

module.exports = {
    extends: ["plugin:@mysticatea/es2020", "plugin:@mysticatea/+node"],
    ignorePatterns: ["/.nyc_output", "/coverage", "/dist"],
    rules: {
        // Buggy.
        "require-atomic-updates": "off",
        "@mysticatea/ts/restrict-plus-operands": "off",

        // Use self.
        dprint: [
            "error",
            {
                config: {
                    lineWidth: 80,
                    semiColons: "asi",
                    quoteStyle: "preferDouble",
                    singleBodyPosition: "sameLine",
                    nextControlFlowPosition: "sameLine",
                    operatorPosition: "sameLine",
                    "arrowFunction.useParentheses": "preferNone",
                    "taggedTemplate.spaceBeforeLiteral": false,
                },
            },
        ],
        "@mysticatea/prettier": "off",
    },
}
