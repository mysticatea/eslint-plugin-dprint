declare type MessageId = "requireLinebreak" | "extraLinebreak" | "requireWhitespace" | "extraWhitespace" | "requireCode" | "extraCode" | "replaceWhitespace" | "replaceCode";
export declare const dprint: import("@typescript-eslint/experimental-utils/dist/ts-eslint/Rule").RuleModule<MessageId, readonly unknown[], {
    Program(): void;
}>;
export {};
