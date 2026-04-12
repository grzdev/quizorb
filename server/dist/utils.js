/**
 * Fisher-Yates shuffle — mutates and returns the array.
 * Generic so it works with any element type.
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
//# sourceMappingURL=utils.js.map