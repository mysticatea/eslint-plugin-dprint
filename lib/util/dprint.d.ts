declare type LoadedDprint = {
    formatFileText: typeof import("@dprint/core").formatFileText;
    resolveConfiguration: typeof import("@dprint/core").resolveConfiguration;
    TypeScriptPlugin: typeof import("dprint-plugin-typescript").TypeScriptPlugin;
};
export declare function loadDprint(filePath: string): LoadedDprint;
export {};
