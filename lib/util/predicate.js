"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasLinebreak = exports.isWhitespace = void 0;
/**
 * Check if a given text is whitespace(s).
 * @param s The text to check.
 */
function isWhitespace(s) {
    return /^\s+$/u.test(s);
}
exports.isWhitespace = isWhitespace;
/**
 * Check if a given text contains line break(s).
 * @param s The text to check.
 */
function hasLinebreak(s) {
    return /[\r\n]/u.test(s);
}
exports.hasLinebreak = hasLinebreak;
//# sourceMappingURL=predicate.js.map