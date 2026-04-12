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
/**
 * Returns a copy of a question with its options shuffled into a random order
 * and correctIndex updated to match the new position of the correct answer.
 */
export function shuffleOptions(q) {
    const correctAnswer = q.options[q.correctIndex];
    if (correctAnswer === undefined) {
        throw new Error(`shuffleOptions: correctIndex ${q.correctIndex} is out of bounds (options.length=${q.options.length})`);
    }
    const shuffled = shuffle([...q.options]);
    return { ...q, options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) };
}
//# sourceMappingURL=utils.js.map