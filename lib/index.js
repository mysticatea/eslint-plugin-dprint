"use strict";
const disable_conflict_rules_1 = require("./configs/disable-conflict-rules");
const recommended_1 = require("./configs/recommended");
const dprint_1 = require("./rules/dprint");
module.exports = {
    configs: {
        "disable-conflict-rules": disable_conflict_rules_1.disableConflictRules,
        recommended: recommended_1.recommended,
    },
    rules: {
        dprint: dprint_1.dprint,
    },
};
//# sourceMappingURL=index.js.map