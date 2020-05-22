"use strict"

module.exports = {
    extends: ["plugin:@mysticatea/es2020", "plugin:@mysticatea/+node"],
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
                    indentWidth: 4,
                    useTabs: false,
                    semiColons: "asi",
                    quoteStyle: "preferDouble",
                    newLineKind: "lf",
                    useBraces: "whenNotSingleLine",
                    bracePosition: "nextLineIfHanging",
                    singleBodyPosition: "sameLine",
                    nextControlFlowPosition: "sameLine",
                    trailingCommas: "onlyMultiLine",
                    operatorPosition: "sameLine",
                    preferSingleLine: true,
                    "arrowFunction.useParentheses": "preferNone",
                },
            },
        ],
        "@mysticatea/prettier": "off",
    },
}
