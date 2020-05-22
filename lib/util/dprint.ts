import {
    createRequire,
    createRequireFromPath, // eslint-disable-line @mysticatea/node/no-deprecated-api
} from "module"

type LoadedDprint = {
    formatFileText: typeof import("@dprint/core").formatFileText
    resolveConfiguration: typeof import("@dprint/core").resolveConfiguration
    TypeScriptPlugin: typeof import("dprint-plugin-typescript").TypeScriptPlugin
}

export function loadDprint(filePath: string): LoadedDprint {
    const requireRel = (createRequire || createRequireFromPath)(filePath)
    const result = {} as LoadedDprint

    /*eslint-disable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */
    try {
        const core = requireRel("@dprint/core")
        result.formatFileText = core.formatFileText
        result.resolveConfiguration = core.resolveConfiguration
    } catch {
        const core = require("@dprint/core")
        result.formatFileText = core.formatFileText
        result.resolveConfiguration = core.resolveConfiguration
    }
    try {
        result.TypeScriptPlugin =
            requireRel("dprint-plugin-typescript").TypeScriptPlugin
    } catch {
        result.TypeScriptPlugin =
            require("dprint-plugin-typescript").TypeScriptPlugin
    }
    /*eslint-enable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */

    return result
}
