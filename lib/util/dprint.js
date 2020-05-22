"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDprint = void 0;
const module_1 = require("module");
function loadDprint(filePath) {
    const requireRel = (module_1.createRequire || module_1.createRequireFromPath)(filePath);
    const result = {};
    /*eslint-disable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */
    try {
        const core = requireRel("@dprint/core");
        result.formatFileText = core.formatFileText;
        result.resolveConfiguration = core.resolveConfiguration;
    }
    catch (_a) {
        const core = require("@dprint/core");
        result.formatFileText = core.formatFileText;
        result.resolveConfiguration = core.resolveConfiguration;
    }
    try {
        result.TypeScriptPlugin =
            requireRel("dprint-plugin-typescript").TypeScriptPlugin;
    }
    catch (_b) {
        result.TypeScriptPlugin =
            require("dprint-plugin-typescript").TypeScriptPlugin;
    }
    /*eslint-enable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */
    return result;
}
exports.loadDprint = loadDprint;
//# sourceMappingURL=dprint.js.map