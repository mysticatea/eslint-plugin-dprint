import { disableConflictRules } from "./disable-conflict-rules"

export const recommended = {
    plugins: ["dprint"],
    rules: {
        ...disableConflictRules.rules,
        "dprint/dprint": "warn",
    },
}
