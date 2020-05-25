import { Change, diffChars } from "diff"
import { isWhitespace } from "./predicate"

/** The difference type for add. */
export type AddDiff = {
    type: "add"
    range: readonly [number, number]
    newText: string
    oldText: undefined
}
/** The difference type for remove. */
export type RemoveDiff = {
    type: "remove"
    range: readonly [number, number]
    newText: undefined
    oldText: string
}
/** The difference type for replace. */
export type ReplaceDiff = {
    type: "replace"
    range: readonly [number, number]
    newText: string
    oldText: string
}
/** The difference type. */
export type Diff = AddDiff | RemoveDiff | ReplaceDiff

/** The defference iterator. */
export class DifferenceIterator {
    public static iterate(s0: string, s1: string): Generator<Diff> {
        return new DifferenceIterator(s0, s1).iterate()
    }

    /** All changes that the `diffChars()` function detected. */
    private readonly changes: readonly Change[]
    /** The current index in `this.changes`. */
    private i = 0
    /** The current index in the original source code text. */
    private loc = 0

    /** Initialize this instance. */
    private constructor(s0: string, s1: string) {
        this.changes = diffChars(s0, s1)
    }

    /** Iterate differences. */
    private *iterate(): Generator<Diff> {
        while (this.i < this.changes.length) {
            const change = this.changeAt(this.i)!

            if (change.added) {
                yield this.handleAdd(change)
            } else if (change.removed) {
                yield this.handleRemove(change)
            } else {
                this.i += 1
                this.loc += change.value.length
            }
        }
    }

    /** Handle the current change (`current.added === true`). */
    private handleAdd(current: Change): Diff {
        const next1 = this.changeAt(this.i + 1)
        const next2 = this.changeAt(this.i + 2)

        // Merge the sequence "added → removed" as a replacement.
        if (next1 && next1.removed) {
            return this.newReplacedDiff(2, next1.value, current.value)
        }

        // Merge the following sequences as a replacement:
        // - "added → as-is → added" and all of the three are whitespaces.
        // - "added → as-is → removed" and the middle is whitespaces and the first and the last contains the same content.
        if (
            next1 &&
            next2 &&
            !next1.added &&
            !next1.removed &&
            isWhitespace(next1.value)
        ) {
            // "added → as-is → added" and all of the three are whitespaces.
            // It frequently appears as adding a line break with indentation.
            if (
                next2.added &&
                isWhitespace(current.value) &&
                isWhitespace(next2.value)
            ) {
                return this.newReplacedDiff(
                    3,
                    next1.value,
                    current.value + next1.value + next2.value,
                )
            }

            // "added → as-is → removed" and the middle is whitespaces and the first and the last contains the same content.
            // It frequently appears as moving code to the previous line.
            if (
                next2.removed &&
                current.value.trim().endsWith(next2.value.trim())
            ) {
                return this.newReplacedDiff(
                    3,
                    next1.value + next2.value,
                    current.value + next1.value,
                )
            }
        }

        return this.newAddedDiff(1, current.value)
    }

    /** Handle the current change (`current.removed === true`). */
    private handleRemove(current: Change): Diff {
        const next1 = this.changeAt(this.i + 1)
        const next2 = this.changeAt(this.i + 2)

        // Merge the sequence "removed → added" as a replacement.
        if (next1 && next1.added) {
            return this.newReplacedDiff(2, current.value, next1.value)
        }

        // Merge the following sequences as a replacement:
        // - "removed → as-is → removed" and all of the three are whitespaces.
        // - "removed → as-is → added" and the middle is whitespaces and the first and the last contains the same content.
        if (
            next1 &&
            next2 &&
            !next1.added &&
            !next1.removed &&
            isWhitespace(next1.value)
        ) {
            // "removed → as-is → removed" and all of the three are whitespaces.
            // It frequently appears as removing a line break with indentation.
            if (
                next2.removed &&
                isWhitespace(current.value) &&
                isWhitespace(next2.value)
            ) {
                return this.newReplacedDiff(
                    3,
                    current.value + next1.value + next2.value,
                    next1.value,
                )
            }

            // "removed → as-is → added" and the middle is whitespaces and the first and the last contains the same content.
            // It frequently appears as moving code to the next line.
            if (
                next2.added &&
                next2.value.trim().startsWith(current.value.trim())
            ) {
                return this.newReplacedDiff(
                    3,
                    current.value + next1.value,
                    next1.value + next2.value,
                )
            }
        }

        // It's a removal.
        return this.newRemovedDiff(1, current.value)
    }

    /** Get the change at `i`. */
    private changeAt(i: number): Change | undefined {
        return i >= 0 && i < this.changes.length ? this.changes[i] : undefined
    }

    /** Create a diff object that type is `added`, and advance the cursor. */
    private newAddedDiff(numChanges: number, newText: string): Diff {
        const range = [this.loc, this.loc] as const

        this.i += numChanges

        return { range, newText, oldText: undefined, type: "add" }
    }

    /** Create a diff object that type is `removed`, and advance the cursor. */
    private newRemovedDiff(numChanges: number, oldText: string): Diff {
        const range = [this.loc, this.loc + oldText.length] as const

        this.i += numChanges
        this.loc += oldText.length

        return { range, newText: undefined, oldText, type: "remove" }
    }

    /** Create a diff object that type is `replaced`, and advance the cursor. */
    private newReplacedDiff(
        numChanges: number,
        oldText: string,
        newText: string,
    ): Diff {
        const range = [this.loc, this.loc + oldText.length] as const

        this.i += numChanges
        this.loc += oldText.length

        return { range, newText, oldText, type: "replace" }
    }
}
