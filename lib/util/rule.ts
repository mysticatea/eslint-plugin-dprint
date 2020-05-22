import { ESLintUtils } from "@typescript-eslint/experimental-utils"
import { version } from "../../package.json"

// eslint-disable-next-line new-cap
export const rule = ESLintUtils.RuleCreator(ruleName =>
    `https://github.com/mysticatea/eslint-plugin-dprint/blob/v${version}/docs/rules/${ruleName}.md`
)
