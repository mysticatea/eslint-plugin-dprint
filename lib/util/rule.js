"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const package_json_1 = require("../../package.json");
// eslint-disable-next-line new-cap
exports.rule = experimental_utils_1.ESLintUtils.RuleCreator(ruleName => `https://github.com/mysticatea/eslint-plugin-dprint/blob/v${package_json_1.version}/docs/rules/${ruleName}.md`);
//# sourceMappingURL=rule.js.map