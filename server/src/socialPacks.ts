import type { Question } from "./rooms.js";
import { shuffle, shuffleOptions } from "./utils.js";

// ---------------------------------------------------------------------------
// Social pack IDs and metadata
// ---------------------------------------------------------------------------

export const SOCIAL_PACK_IDS = ["wkmb"] as const;
export type SocialPackId = (typeof SOCIAL_PACK_IDS)[number];

export interface PackMeta {
  id: SocialPackId;
  name: string;
  description: string;
}

export const PACK_META: Record<SocialPackId, PackMeta> = {
  "wkmb": {
    id: "wkmb",
    name: "Who Knows Me Best",
    description: "Generic personal questions — players guess the host's answers.",
  },
};

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------

const dataset: (Question & { pack: SocialPackId })[] = [

  // ── Who Knows Me Best ─────────────────────────────────────────────────────
  {
    pack: "wkmb",
    text: "What is my favourite season?",
    options: ["Spring", "Summer", "Autumn", "Winter"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "Which do I prefer for a night in?",
    options: ["Movie marathon", "Video games", "Reading", "Board games"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "What is my go-to comfort food?",
    options: ["Pizza", "Ice cream", "Chips", "Chocolate"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "How do I take my coffee?",
    options: ["Black", "With milk", "With sugar and milk", "I don't drink coffee"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "Which holiday destination appeals to me most?",
    options: ["Beach resort", "City break", "Mountain hiking", "Countryside retreat"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "What is my biggest pet peeve?",
    options: ["Being late", "Loud chewing", "Interrupting", "Dirty dishes"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "Which sport would I most likely play for fun?",
    options: ["Football", "Tennis", "Swimming", "Basketball"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "What time do I usually wake up on weekends?",
    options: ["Before 7am", "7–9am", "9–11am", "After 11am"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "What genre of music do I listen to most?",
    options: ["Pop", "Rock", "Hip-hop / R&B", "Electronic"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "Which type of film do I enjoy most?",
    options: ["Action / thriller", "Comedy", "Horror", "Drama / romance"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "How do I prefer to spend a free Sunday afternoon?",
    options: ["Outdoors / active", "Relaxing at home", "Socialising with friends", "Running errands"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "Which animal would I most like as a pet?",
    options: ["Dog", "Cat", "Bird", "Reptile"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "What is my usual way of cheering myself up?",
    options: ["Watching something funny", "Going for a walk", "Calling a friend", "Eating something nice"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "Which word describes me best?",
    options: ["Ambitious", "Laid-back", "Creative", "Practical"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "What is my favourite meal of the day?",
    options: ["Breakfast", "Lunch", "Dinner", "Late-night snack"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "How do I handle stress best?",
    options: ["Exercise", "Talking it out", "Quiet alone time", "Keeping busy"],
    correctIndex: 0,
    timeLimit: 20,
  },
  {
    pack: "wkmb",
    text: "What social setting am I most comfortable in?",
    options: ["One-on-one with a close friend", "Small group of friends", "Big party", "Online / messaging"],
    correctIndex: 0,
    timeLimit: 20,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns up to `count` shuffled questions from the given pack.
 * If count is omitted or exceeds the pool size, returns the full shuffled pool.
 */
export function getPackQuestions(pack: SocialPackId, count?: number, exclude?: Set<string>): Question[] {
  const raw = dataset.filter((q) => q.pack === pack);

  // Deduplicate by prompt text so the same question never appears twice in one game
  const seen = new Set<string>();
  const pool = raw.filter((q) => {
    if (seen.has(q.text)) return false;
    seen.add(q.text);
    return true;
  });

  // Prefer questions not seen in previous rounds; fall back to used ones if needed
  const normalise = (t: string) => t.toLowerCase().trim();
  const preferred = exclude ? pool.filter((q) => !exclude.has(normalise(q.text))) : pool;
  const fallback  = exclude ? pool.filter((q) =>  exclude.has(normalise(q.text))) : [];
  const combined  = (count === undefined || preferred.length >= count)
    ? preferred
    : [...preferred, ...fallback];

  const shuffled = shuffle([...combined]);
  // If count exceeds the unique pool, return all available unique questions
  const selected = count !== undefined ? shuffled.slice(0, count) : shuffled;
  // Shuffle options so the correct answer position varies per question
  return selected.map(({ pack: _pack, ...q }) => shuffleOptions(q));
}
