import { shuffle, shuffleOptions } from "./utils.js";
// ---------------------------------------------------------------------------
// Dataset
// Schema: { topic, text, options[], correctIndex, timeLimit }
// ---------------------------------------------------------------------------
const dataset = [
    // ── Science ───────────────────────────────────────────────────────────────
    {
        topic: "science",
        text: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "H2"],
        correctIndex: 0,
        timeLimit: 20,
    },
    {
        topic: "science",
        text: "How many planets are in the Solar System?",
        options: ["7", "8", "9", "10"],
        correctIndex: 1,
        timeLimit: 20,
    },
    {
        topic: "science",
        text: "What force keeps planets in orbit around the Sun?",
        options: ["Magnetism", "Nuclear force", "Gravity", "Friction"],
        correctIndex: 2,
        timeLimit: 20,
    },
    {
        topic: "science",
        text: "What is the speed of light in a vacuum (approx.)?",
        options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "3,000 km/s"],
        correctIndex: 0,
        timeLimit: 20,
    },
    {
        topic: "science",
        text: "What gas do plants absorb during photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        correctIndex: 2,
        timeLimit: 20,
    },
    // ── History ───────────────────────────────────────────────────────────────
    {
        topic: "history",
        text: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correctIndex: 2,
        timeLimit: 20,
    },
    {
        topic: "history",
        text: "Who was the first President of the United States?",
        options: ["John Adams", "Thomas Jefferson", "Benjamin Franklin", "George Washington"],
        correctIndex: 3,
        timeLimit: 20,
    },
    {
        topic: "history",
        text: "Which empire built the Colosseum?",
        options: ["Greek", "Ottoman", "Roman", "Byzantine"],
        correctIndex: 2,
        timeLimit: 20,
    },
    {
        topic: "history",
        text: "The French Revolution began in which year?",
        options: ["1776", "1789", "1804", "1815"],
        correctIndex: 1,
        timeLimit: 20,
    },
    {
        topic: "history",
        text: "Who wrote the 'I Have a Dream' speech?",
        options: ["Malcolm X", "Barack Obama", "Martin Luther King Jr.", "John F. Kennedy"],
        correctIndex: 2,
        timeLimit: 20,
    },
    // ── Technology ────────────────────────────────────────────────────────────
    {
        topic: "technology",
        text: "What does CPU stand for?",
        options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Program Utility",
            "Core Processing Unit",
        ],
        correctIndex: 0,
        timeLimit: 20,
    },
    {
        topic: "technology",
        text: "Which company created the JavaScript programming language?",
        options: ["Microsoft", "Google", "Netscape", "Apple"],
        correctIndex: 2,
        timeLimit: 20,
    },
    {
        topic: "technology",
        text: "What does HTTP stand for?",
        options: [
            "HyperText Transfer Protocol",
            "High Transfer Text Protocol",
            "Hyper Terminal Transfer Process",
            "Home Text Transfer Protocol",
        ],
        correctIndex: 0,
        timeLimit: 20,
    },
    {
        topic: "technology",
        text: "Which data structure uses LIFO ordering?",
        options: ["Queue", "Stack", "Heap", "Tree"],
        correctIndex: 1,
        timeLimit: 20,
    },
    {
        topic: "technology",
        text: "What is the base of the binary number system?",
        options: ["8", "10", "16", "2"],
        correctIndex: 3,
        timeLimit: 20,
    },
    // ── Geography ─────────────────────────────────────────────────────────────
    {
        topic: "geography",
        text: "What is the capital of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        correctIndex: 2,
        timeLimit: 20,
    },
    {
        topic: "geography",
        text: "Which is the longest river in the world?",
        options: ["Amazon", "Yangtze", "Mississippi", "Nile"],
        correctIndex: 3,
        timeLimit: 20,
    },
    {
        topic: "geography",
        text: "On which continent is the Sahara Desert located?",
        options: ["Asia", "Australia", "Africa", "South America"],
        correctIndex: 2,
        timeLimit: 20,
    },
    {
        topic: "geography",
        text: "What is the smallest country in the world by area?",
        options: ["Monaco", "San Marino", "Liechtenstein", "Vatican City"],
        correctIndex: 3,
        timeLimit: 20,
    },
    {
        topic: "geography",
        text: "Which ocean is the largest?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctIndex: 3,
        timeLimit: 20,
    },
];
/**
 * Returns `count` shuffled questions for the given topic.
 * Throws if the topic has fewer questions than requested.
 */
export function generateQuiz(topic, count, exclude) {
    const raw = dataset.filter((q) => q.topic === topic);
    // Deduplicate by prompt text so the same question never appears twice in one game
    const seen = new Set();
    const pool = raw.filter((q) => {
        if (seen.has(q.text))
            return false;
        seen.add(q.text);
        return true;
    });
    // Prefer questions not seen in previous rounds; fall back to used ones to fill the count
    const normalise = (t) => t.toLowerCase().trim();
    const preferred = exclude ? pool.filter((q) => !exclude.has(normalise(q.text))) : pool;
    const fallback = exclude ? pool.filter((q) => exclude.has(normalise(q.text))) : [];
    const combined = preferred.length >= count ? preferred : [...preferred, ...fallback];
    if (combined.length === 0) {
        throw new Error(`Not enough unique questions for topic "${topic}": requested ${count}, available ${pool.length}`);
    }
    // Shallow-copy before shuffling so the dataset order is preserved
    const shuffled = shuffle([...combined]);
    const selected = shuffled.slice(0, count);
    // Strip "topic" before returning — callers only need Question fields
    // Shuffle options so the correct answer position varies per question
    return selected.map(({ topic: _topic, ...q }) => shuffleOptions(q));
}
//# sourceMappingURL=quiz.js.map