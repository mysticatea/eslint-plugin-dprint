"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
// eslint-disable-next-line new-cap
exports.rule = experimental_utils_1.ESLintUtils.RuleCreator(ruleName => `https://github.com/mysticatea/eslint-plugin-dprint/blob/master/docs/rules/${ruleName}.md`);
//# sourceMappingURL=rule.js.map