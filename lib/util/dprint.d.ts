declare type TFormatFileText = typeof import("@dprint/core").formatFileText;
declare type TResolveConfiguration = typeof import("@dprint/core").resolveConfiguration;
declare type TypeScriptPlugin = typeof import("dprint-plugin-typescript").TypeScriptPlugin;
declare type LoadedDprint = {
    formatFileText: TFormatFileText;
    resolveConfiguration: TResolveConfiguration;
    TypeScriptPlugin: TypeScriptPlugin;
};
/**
 * Load `@dprint/core` and `dprint-plugin-typescript` from the location of relative to a given path.
 * If not found, load the two from the dependencies of this plugin.
 * @param filePath The path to a source code file.
 * @returns The loaded items.
 */
export declare function loadDprint(filePath: string): LoadedDprint;
export {};
