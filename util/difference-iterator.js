"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DifferenceIterator = void 0;
const diff_1 = require("diff");
const predicate_1 = require("./predicate");
/** The defference iterator. */
class DifferenceIterator {
    /** Initialize this instance. */
    constructor(s0, s1) {
        /** The current index in `this.changes`. */
        this.i = 0;
        /** The current index in the original source code text. */
        this.loc = 0;
        this.changes = diff_1.diffChars(s0, s1);
    }
    static iterate(s0, s1) {
        return new DifferenceIterator(s0, s1).iterate();
    }
    /** Iterate differences. */
    *iterate() {
        while (this.i < this.changes.length) {
            const change = this.changeAt(this.i);
            if (change.added) {
                yield this.handleAdd(change);
            }
            else if (change.removed) {
                yield this.handleRemove(change);
            }
            else {
                this.i += 1;
                this.loc += change.value.length;
            }
        }
    }
    /** Handle the current change (`current.added === true`). */
    handleAdd(current) {
        const next1 = this.changeAt(this.i + 1);
        const next2 = this.changeAt(this.i + 2);
        // Merge the sequence "added → removed" as a replacement.
        if (next1 && next1.removed) {
            return this.newReplacedDiff(2, next1.value, current.value);
        }
        // Merge the following sequences as a replacement:
        // - "added → as-is → added" and all of the three are whitespaces.
        // - "added → as-is → removed" and the middle is whitespaces and the first and the last contains the same content.
        if (next1 &&
            next2 &&
            !next1.added &&
            !next1.removed &&
            predicate_1.isWhitespace(next1.value)) {
            // "added → as-is → added" and all of the three are whitespaces.
            // It frequently appears as adding a line break with indentation.
            if (next2.added &&
                predicate_1.isWhitespace(current.value) &&
                predicate_1.isWhitespace(next2.value)) {
                return this.newReplacedDiff(3, next1.value, current.value + next1.value + next2.value);
            }
            // "added → as-is → removed" and the middle is whitespaces and the first and the last contains the same content.
            // It frequently appears as moving code to the previous line.
            if (next2.removed &&
                current.value.trim().endsWith(next2.value.trim())) {
                return this.newReplacedDiff(3, next1.value + next2.value, current.value + next1.value);
            }
        }
        return this.newAddedDiff(1, current.value);
    }
    /** Handle the current change (`current.removed === true`). */
    handleRemove(current) {
        const next1 = this.changeAt(this.i + 1);
        const next2 = this.changeAt(this.i + 2);
        // Merge the sequence "removed → added" as a replacement.
        if (next1 && next1.added) {
            return this.newReplacedDiff(2, current.value, next1.value);
        }
        // Merge the following sequences as a replacement:
        // - "removed → as-is → removed" and all of the three are whitespaces.
        // - "removed → as-is → added" and the middle is whitespaces and the first and the last contains the same content.
        if (next1 &&
            next2 &&
            !next1.added &&
            !next1.removed &&
            predicate_1.isWhitespace(next1.value)) {
            // "removed → as-is → removed" and all of the three are whitespaces.
            // It frequently appears as removing a line break with indentation.
            if (next2.removed &&
                predicate_1.isWhitespace(current.value) &&
                predicate_1.isWhitespace(next2.value)) {
                return this.newReplacedDiff(3, current.value + next1.value + next2.value, next1.value);
            }
            // "removed → as-is → added" and the middle is whitespaces and the first and the last contains the same content.
            // It frequently appears as moving code to the next line.
            if (next2.added &&
                next2.value.trim().startsWith(current.value.trim())) {
                return this.newReplacedDiff(3, current.value + next1.value, next1.value + next2.value);
            }
        }
        // It's a removal.
        return this.newRemovedDiff(1, current.value);
    }
    /** Get the change at `i`. */
    changeAt(i) {
        return i >= 0 && i < this.changes.length ? this.changes[i] : undefined;
    }
    /** Create a diff object that type is `added`, and advance the cursor. */
    newAddedDiff(numChanges, newText) {
        const range = [this.loc, this.loc];
        this.i += numChanges;
        return { range, newText, oldText: undefined, type: "add" };
    }
    /** Create a diff object that type is `removed`, and advance the cursor. */
    newRemovedDiff(numChanges, oldText) {
        const range = [this.loc, this.loc + oldText.length];
        this.i += numChanges;
        this.loc += oldText.length;
        return { range, newText: undefined, oldText, type: "remove" };
    }
    /** Create a diff object that type is `replaced`, and advance the cursor. */
    newReplacedDiff(numChanges, oldText, newText) {
        const range = [this.loc, this.loc + oldText.length];
        this.i += numChanges;
        this.loc += oldText.length;
        return { range, newText, oldText, type: "replace" };
    }
}
exports.DifferenceIterator = DifferenceIterator;
//# sourceMappingURL=difference-iterator.js.map