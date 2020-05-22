declare const _default: {
    configs: {
        recommended: {
            plugins: string[];
            rules: {
                "dprint/dprint": string;
            };
        };
    };
    rules: {
        dprint: import("@typescript-eslint/experimental-utils/dist/ts-eslint/Rule").RuleModule<"requireLinebreak" | "extraLinebreak" | "requireWhitespace" | "extraWhitespace" | "requireCode" | "extraCode" | "replaceWhitespace" | "replaceCode", readonly unknown[], {
            Program(): void;
        }>;
    };
};
export = _default;
