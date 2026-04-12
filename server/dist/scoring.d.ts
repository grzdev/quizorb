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
export declare function calculateScore(isCorrect: boolean, timeTaken: number, timeLimit: number): number;
//# sourceMappingURL=scoring.d.ts.map