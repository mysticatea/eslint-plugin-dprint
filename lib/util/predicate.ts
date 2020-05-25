/**
 * Check if a given text is whitespace(s).
 * @param s The text to check.
 */
export function isWhitespace(s: string): boolean {
    return /^\s+$/u.test(s)
}

/**
 * Check if a given text contains line break(s).
 * @param s The text to check.
 */
export function hasLinebreak(s: string): boolean {
    return /[\r\n]/u.test(s)
}
