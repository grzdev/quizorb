import type { Question } from "./rooms.js";
export type Topic = "science" | "history" | "technology" | "geography";
/**
 * Returns `count` shuffled questions for the given topic.
 * Throws if the topic has fewer questions than requested.
 */
export declare function generateQuiz(topic: Topic, count: number): Question[];
//# sourceMappingURL=quiz.d.ts.map