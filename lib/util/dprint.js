"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDprint = void 0;
const module_1 = require("module");
const debug_1 = __importDefault(require("debug"));
// To dump debug information if `--debug` flag is present.
const debug = debug_1.default("eslint:plugin-dprint");
/**
 * Wrap a given function to ignore thrown exceptions.
 * @param formatFileText The format function to wrap.
 * @returns The wrapped function.
 */
function wrap(formatFileText) {
    return (...args) => {
        try {
            return formatFileText(...args);
        }
        catch (error) {
            debug("'formatFileText' function threw: %o", error);
            return false;
        }
    };
}
/**
 * Load `@dprint/core` and `dprint-plugin-typescript` from the location of relative to a given path.
 * If not found, load the two from the dependencies of this plugin.
 * @param filePath The path to a source code file.
 * @returns The loaded items.
 */
function loadDprint(filePath) {
    const requireRel = (module_1.createRequire || module_1.createRequireFromPath)(filePath);
    let corePath;
    let tsPluginPath;
    try {
        corePath = requireRel.resolve("@dprint/core");
        debug("Use '@dprint/core' as relative to %o", filePath);
    }
    catch (_a) {
        corePath = require.resolve("@dprint/core");
        debug("Use the default '@dprint/core'");
    }
    debug("\t→ %o", corePath);
    try {
        tsPluginPath = requireRel.resolve("dprint-plugin-typescript");
        debug("Use 'dprint-plugin-typescript' as relative to %o", filePath);
    }
    catch (_b) {
        tsPluginPath = require.resolve("dprint-plugin-typescript");
        debug("Use the default 'dprint-plugin-typescript'");
    }
    debug("\t→ %o", tsPluginPath);
    /*eslint-disable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */
    const core = require(corePath);
    const ts = require(tsPluginPath);
    /*eslint-enable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */
    return {
        formatFileText: wrap(core.formatFileText),
        resolveConfiguration: core.resolveConfiguration,
        TypeScriptPlugin: ts.TypeScriptPlugin,
    };
}
exports.loadDprint = loadDprint;
//# sourceMappingURL=dprint.js.map