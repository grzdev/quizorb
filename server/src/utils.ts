/**
 * Fisher-Yates shuffle — mutates and returns the array.
 * Generic so it works with any element type.
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j] as T, array[i] as T];
  }
  return array;
}

/**
 * Returns a copy of a question with its options shuffled into a random order
 * and correctIndex updated to match the new position of the correct answer.
 */
export function shuffleOptions<T extends { options: string[]; correctIndex: number }>(q: T): T {
  const correctAnswer = q.options[q.correctIndex];
  const shuffled = shuffle([...q.options]);
  return { ...q, options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) };
}
