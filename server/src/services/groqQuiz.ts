import { getGroqClient } from "../groq.js";
import { shuffleOptions } from "../utils.js";

export interface GroqQuestion {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  timeLimit: number;
}

function isValidQuestion(q: unknown): q is GroqQuestion {
  if (!q || typeof q !== "object") return false;
  const obj = q as Record<string, unknown>;

  // Accept either 'text' or 'prompt' as the question field
  const text = typeof obj.text === "string" ? obj.text : typeof obj.prompt === "string" ? obj.prompt : "";
  if (!text.trim()) return false;

  // Must have exactly 4 non-empty string options
  if (!Array.isArray(obj.options) || obj.options.length !== 4) return false;
  if (obj.options.some((o) => typeof o !== "string" || !o.trim())) return false;

  // correctIndex must be an integer 0–3
  if (!Number.isInteger(obj.correctIndex)) return false;
  if ((obj.correctIndex as number) < 0 || (obj.correctIndex as number) > 3) return false;

  return true;
}

/** Shared post-processing: parse raw LLM output, validate, deduplicate, shuffle. */
function parseResponse(raw: string): GroqQuestion[] {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const seen = new Set<string>();
  const valid: GroqQuestion[] = [];

  for (const item of parsed) {
    if (!isValidQuestion(item)) continue;
    const q = normalise(item);
    const key = q.text.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    valid.push(shuffleOptions(q));
  }

  return valid;
}

function normalise(raw: unknown): GroqQuestion {
  const obj = raw as Record<string, unknown>;
  return {
    text: (typeof obj.text === "string" ? obj.text : obj.prompt as string).trim(),
    options: (obj.options as string[]).map((o) => o.trim()) as [string, string, string, string],
    correctIndex: obj.correctIndex as number,
    timeLimit: typeof obj.timeLimit === "number" ? obj.timeLimit : 20,
  };
}

export async function generateGroqQuiz(topic: string, count: number): Promise<GroqQuestion[]> {
  const safeCount = Math.min(Math.max(1, count), 20);

  const prompt = `Generate ${safeCount} multiple choice quiz questions about "${topic}".

Rules:
- Each question must be distinct and not repeat.
- Each question must have exactly 4 options.
- options must be concise (under 10 words each).
- correctIndex is 0-3 (index of the correct option in the options array).
- timeLimit is always 20.

Return ONLY valid JSON — no markdown, no explanation, just the array:

[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "timeLimit": 20
  }
]`;

  let response: Awaited<ReturnType<ReturnType<typeof getGroqClient>["chat"]["completions"]["create"]>>;
  try {
    response = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });
  } catch (err) {
    const e = err as Error & { status?: number; response?: { data?: unknown } };
    console.error("[groqQuiz/generateGroqQuiz] Groq API error:");
    console.error("  name   :", e.name);
    console.error("  message:", e.message);
    if (e.status !== undefined) console.error("  status :", e.status);
    if (e.response?.data !== undefined) console.error("  response.data:", e.response.data);
    throw e;
  }

  const raw = response.choices[0]?.message?.content ?? "[]";
  return parseResponse(raw);
}

/**
 * Generate quiz questions directly from extracted document text.
 * The text is embedded in the prompt so Groq derives questions from its content.
 */
export async function generateGroqQuizFromText(
  text: string,
  count: number,
): Promise<GroqQuestion[]> {
  const safeCount = Math.min(Math.max(1, count), 20);

  const prompt = `You are a quiz generator. Read the following document content and generate ${safeCount} multiple choice questions based strictly on the information it contains.

Rules:
- Each question must be answerable from the content below — do not invent facts.
- Each question must have exactly 4 options.
- Options must be concise (under 10 words each).
- correctIndex is 0-3 (index of the correct option in the options array).
- timeLimit is always 20.
- Do not repeat questions.

Return ONLY valid JSON — no markdown, no explanation, just the array:

[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "timeLimit": 20
  }
]

--- DOCUMENT CONTENT START ---
${text}
--- DOCUMENT CONTENT END ---`;

  let response: Awaited<ReturnType<ReturnType<typeof getGroqClient>["chat"]["completions"]["create"]>>;
  try {
    response = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
  } catch (err) {
    const e = err as Error & { status?: number; response?: { data?: unknown } };
    console.error("[groqQuiz/generateGroqQuizFromText] Groq API error:");
    console.error("  name   :", e.name);
    console.error("  message:", e.message);
    if (e.status !== undefined) console.error("  status :", e.status);
    if (e.response?.data !== undefined) console.error("  response.data:", e.response.data);
    throw e;
  }

  const raw = response.choices[0]?.message?.content ?? "[]";
  return parseResponse(raw);
}
