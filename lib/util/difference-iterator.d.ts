/** The difference type for add. */
export declare type AddDiff = {
    type: "add";
    range: readonly [number, number];
    newText: string;
    oldText: undefined;
};
/** The difference type for remove. */
export declare type RemoveDiff = {
    type: "remove";
    range: readonly [number, number];
    newText: undefined;
    oldText: string;
};
/** The difference type for replace. */
export declare type ReplaceDiff = {
    type: "replace";
    range: readonly [number, number];
    newText: string;
    oldText: string;
};
/** The difference type. */
export declare type Diff = AddDiff | RemoveDiff | ReplaceDiff;
/** The defference iterator. */
export declare class DifferenceIterator {
    static iterate(s0: string, s1: string): Generator<Diff>;
    /** All changes that the `diffChars()` function detected. */
    private readonly changes;
    /** The current index in `this.changes`. */
    private i;
    /** The current index in the original source code text. */
    private loc;
    /** Initialize this instance. */
    private constructor();
    /** Iterate differences. */
    private iterate;
    /** Handle the current change (`current.added === true`). */
    private handleAdd;
    /** Handle the current change (`current.removed === true`). */
    private handleRemove;
    /** Get the change at `i`. */
    private changeAt;
    /** Create a diff object that type is `added`, and advance the cursor. */
    private newAddedDiff;
    /** Create a diff object that type is `removed`, and advance the cursor. */
    private newRemovedDiff;
    /** Create a diff object that type is `replaced`, and advance the cursor. */
    private newReplacedDiff;
}
