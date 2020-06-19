"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommended = void 0;
const disable_conflict_rules_1 = require("./disable-conflict-rules");
exports.recommended = {
    plugins: ["dprint"],
    rules: Object.assign(Object.assign({}, disable_conflict_rules_1.disableConflictRules.rules), { "dprint/dprint": "error" }),
};
//# sourceMappingURL=recommended.js.map