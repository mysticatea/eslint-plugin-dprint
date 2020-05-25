import {
    createRequire,
    createRequireFromPath, // eslint-disable-line @mysticatea/node/no-deprecated-api
} from "module"
import createDebug from "debug"

// To dump debug information if `--debug` flag is present.
const debug = createDebug("eslint:plugin-dprint")

// Types
type TFormatFileText = typeof import("@dprint/core").formatFileText
type TResolveConfiguration = typeof import("@dprint/core").resolveConfiguration
type TypeScriptPlugin =
    typeof import("dprint-plugin-typescript").TypeScriptPlugin
type LoadedDprint = {
    formatFileText: TFormatFileText
    resolveConfiguration: TResolveConfiguration
    TypeScriptPlugin: TypeScriptPlugin
}

/**
 * Wrap a given function to ignore thrown exceptions.
 * @param formatFileText The format function to wrap.
 * @returns The wrapped function.
 */
function wrap(formatFileText: TFormatFileText): TFormatFileText {
    return (
        ...args: Parameters<TFormatFileText>
    ): ReturnType<TFormatFileText> => {
        try {
            return formatFileText(...args)
        } catch (error) {
            debug("'formatFileText' function threw: %o", error)
            return false
        }
    }
}

/**
 * Load `@dprint/core` and `dprint-plugin-typescript` from the location of relative to a given path.
 * If not found, load the two from the dependencies of this plugin.
 * @param filePath The path to a source code file.
 * @returns The loaded items.
 */
export function loadDprint(filePath: string): LoadedDprint {
    const requireRel = (createRequire || createRequireFromPath)(filePath)
    let corePath: string
    let tsPluginPath: string

    try {
        corePath = requireRel.resolve("@dprint/core")
        debug("Use '@dprint/core' as relative to %o", filePath)
    } catch {
        corePath = require.resolve("@dprint/core")
        debug("Use the default '@dprint/core'")
    }
    debug("\t→ %o", corePath)

    try {
        tsPluginPath = requireRel.resolve("dprint-plugin-typescript")
        debug("Use 'dprint-plugin-typescript' as relative to %o", filePath)
    } catch {
        tsPluginPath = require.resolve("dprint-plugin-typescript")
        debug("Use the default 'dprint-plugin-typescript'")
    }
    debug("\t→ %o", tsPluginPath)

    /*eslint-disable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */
    const core = require(corePath)
    const ts = require(tsPluginPath)
    /*eslint-enable @mysticatea/ts/no-require-imports, @mysticatea/ts/no-var-requires */

    return {
        formatFileText: wrap(core.formatFileText),
        resolveConfiguration: core.resolveConfiguration,
        TypeScriptPlugin: ts.TypeScriptPlugin,
    }
}
