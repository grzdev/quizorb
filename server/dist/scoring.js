/**
 * Time-weighted scoring formula:
 *
 *   awardedPoints = round(MAX_POINTS × max(MIN_RATIO, 1 − timeTaken / timeLimit))
 *
 * - Answering instantly  → MAX_POINTS (1000)
 * - Answering at the deadline → MAX_POINTS × MIN_RATIO (500)
 * - Linear decay between the two extremes
 * - Wrong answers always score 0
 */
const MAX_POINTS = 1000;
const MIN_RATIO = 0.5; // slowest correct answer still earns 50 %
export function calculateScore(isCorrect, timeTaken, timeLimit) {
    if (!isCorrect)
        return 0;
    const ratio = Math.max(MIN_RATIO, 1 - timeTaken / timeLimit);
    return Math.round(MAX_POINTS * ratio);
}
//# sourceMappingURL=scoring.js.map