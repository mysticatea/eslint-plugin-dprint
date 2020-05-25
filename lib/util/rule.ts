import { ESLintUtils } from "@typescript-eslint/experimental-utils"

// eslint-disable-next-line new-cap
export const rule = ESLintUtils.RuleCreator(ruleName =>
    `https://github.com/mysticatea/eslint-plugin-dprint/blob/master/docs/rules/${ruleName}.md`
)
