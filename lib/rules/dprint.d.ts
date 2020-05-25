import { TSESLint } from "@typescript-eslint/experimental-utils";
export declare const dprint: TSESLint.RuleModule<"requireLinebreak" | "extraLinebreak" | "requireWhitespace" | "extraWhitespace" | "requireCode" | "extraCode" | "replaceWhitespace" | "replaceCode" | "moveCodeToNextLine" | "moveCodeToPrevLine" | "moveCode", readonly unknown[], {
    Program(): void;
}>;
