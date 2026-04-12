/**
 * Fisher-Yates shuffle — mutates and returns the array.
 * Generic so it works with any element type.
 */
export declare function shuffle<T>(array: T[]): T[];
/**
 * Returns a copy of a question with its options shuffled into a random order
 * and correctIndex updated to match the new position of the correct answer.
 */
export declare function shuffleOptions<T extends {
    options: string[];
    correctIndex: number;
}>(q: T): T;
//# sourceMappingURL=utils.d.ts.map