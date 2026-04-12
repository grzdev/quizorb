import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

import cors from "cors";
import express from "express";
import { createServer } from "http";
import multer from "multer";
import { Server } from "socket.io";
import { registerHandlers } from "./handlers.js";
import { generateQuiz, type Topic } from "./quiz.js";
import {
  getPackQuestions,
  PACK_META,
  SOCIAL_PACK_IDS,
  type SocialPackId,
} from "./socialPacks.js";
import { createRoom, getRoom, type HostMode, type RoomMode, type SocialModeType, type QuizSource } from "./rooms.js";
import { extractText } from "./services/extractText.js";
import { generateGroqQuiz, generateGroqQuizFromText } from "./services/groqQuiz.js";
import type { Question } from "./rooms.js";

const ALLOWED_MIMETYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter(_req, file, cb) {
    const ext = file.originalname.toLowerCase().split(".").pop();
    if (ALLOWED_MIMETYPES.has(file.mimetype) || ext === "txt" || ext === "pdf" || ext === "docx") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOCX, and TXT files are allowed"));
    }
  },
});

const PORT = Number(process.env.PORT) || 4000;
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://quizorb.netlify.app",
];

const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// POST /api/quizzes/generate
app.post("/api/quizzes/generate", (req, res) => {
  const { topic, count } = req.body as { topic: Topic; count: number };

  if (!topic || !count) {
    res.status(400).json({ error: "topic and count are required" });
    return;
  }

  try {
    const questions = generateQuiz(topic, Number(count));
    res.json({ questions });
  } catch (err) {
    console.error("[quizzes/generate] error:", err);
    res.status(400).json({ error: "Failed to generate quiz", details: (err as Error).message });
  }
});

// POST /api/quizzes/groq-generate
app.post("/api/quizzes/groq-generate", async (req, res) => {
  console.log("[quizzes/groq-generate] route hit");

  const body: unknown = req.body;
  if (body === null || body === undefined || typeof body !== "object" || Array.isArray(body)) {
    res.status(400).json({ error: "Missing JSON body" });
    return;
  }

  const { topic, count } = body as Record<string, unknown>;
  console.log(`[quizzes/groq-generate] topic: ${JSON.stringify(topic)} | count: ${JSON.stringify(count)}`);
  console.log(`[quizzes/groq-generate] GROQ_API_KEY exists: ${!!process.env.GROQ_API_KEY}`);

  if (topic === undefined || topic === null || typeof topic !== "string" || !topic.trim()) {
    res.status(400).json({ error: "topic is required and must be a non-empty string" });
    return;
  }

  if (count === undefined || count === null || typeof count !== "number") {
    res.status(400).json({ error: "count is required and must be a number" });
    return;
  }

  const safeCount = Math.min(Math.max(1, count), 20);

  try {
    const questions = await generateGroqQuiz(topic.trim(), safeCount);
    if (questions.length === 0) {
      res.status(502).json({ error: "AI returned no valid questions. Try a different topic." });
      return;
    }
    res.json({ questions });
  } catch (err) {
    const e = err as Error & { status?: number; response?: { data?: unknown } };
    console.error("[quizzes/groq-generate] Groq call failed:");
    console.error("  name   :", e.name);
    console.error("  message:", e.message);
    if (e.status !== undefined) console.error("  status :", e.status);
    if (e.response?.data !== undefined) console.error("  response.data:", e.response.data);
    res.status(500).json({ error: "Failed to generate quiz", details: e.message });
  }
});

// POST /api/quizzes/from-file — extract text then generate quiz questions via Groq
app.post("/api/quizzes/from-file", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("[from-file] multer error:", err.message);
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req, res) => {
  console.log("[from-file] route hit");

  if (!req.file) {
    console.warn("[from-file] no file in request");
    res.status(400).json({ error: "No file uploaded. Send a PDF, DOCX, or TXT as multipart field 'file'." });
    return;
  }

  console.log(`[from-file] file: ${req.file.originalname} | type: ${req.file.mimetype} | size: ${req.file.size} bytes`);

  const ext = req.file.originalname.toLowerCase().split(".").pop();
  const allowedExts = new Set(["pdf", "docx", "txt"]);
  if (!allowedExts.has(ext ?? "")) {
    res.status(400).json({ error: `Unsupported file type ".${ext}". Please upload a PDF, DOCX, or TXT file.` });
    return;
  }

  const rawCount = req.body.count;
  const count = rawCount !== undefined ? Math.min(Math.max(1, Number(rawCount) || 10), 20) : 10;

  let text: string;
  try {
    text = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    console.log(`[from-file] extracted ${text.length} chars`);
  } catch (err) {
    console.error("[from-file] extraction error:", err);
    res.status(422).json({ error: "Failed to generate quiz", details: `Could not read the file: ${(err as Error).message}` });
    return;
  }

  if (!text.trim()) {
    console.warn("[from-file] extracted text is empty");
    res.status(422).json({ error: "No readable text found in the file. Make sure it isn't an image-only PDF or empty document." });
    return;
  }

  let questions: Awaited<ReturnType<typeof generateGroqQuizFromText>>;
  try {
    questions = await generateGroqQuizFromText(text, count);
    console.log(`[from-file] Groq returned ${questions.length} valid questions`);
  } catch (err) {
    console.error("[from-file] Groq error:", err);
    res.status(502).json({ error: "Failed to generate quiz", details: (err as Error).message });
    return;
  }

  if (questions.length === 0) {
    res.status(502).json({ error: "The AI couldn't generate questions from this file. Try a file with more detailed content." });
    return;
  }

  res.json({ questions });
});

// GET /api/packs — list all available social packs
app.get("/api/packs", (_req, res) => {
  res.json({ packs: SOCIAL_PACK_IDS.map((id) => PACK_META[id]) });
});

// GET /api/packs/:pack — fetch questions for a specific pack
app.get("/api/packs/:pack", (req, res) => {
  const id = req.params.pack as SocialPackId;
  if (!SOCIAL_PACK_IDS.includes(id)) {
    res.status(404).json({ error: `Pack "${id}" not found` });
    return;
  }
  const rawCount = req.query.count;
  const count = rawCount !== undefined ? Number(rawCount) : undefined;
  if (count !== undefined && (!Number.isInteger(count) || count < 1)) {
    res.status(400).json({ error: "count must be a positive integer" });
    return;
  }
  const questions = getPackQuestions(id, count);
  res.json({ pack: PACK_META[id], questions });
});

// POST /api/rooms/create
app.post("/api/rooms/create", (req, res) => {
  const { questions, mode, hostMode, socialModeType, hostAnswers, quizSource } = req.body as {
    title: string;
    topic: string;
    questions: Question[];
    mode?: RoomMode;
    hostMode?: HostMode;
    socialModeType?: SocialModeType;
    hostAnswers?: Record<string, number>;
    quizSource?: QuizSource;
  };

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    res.status(400).json({ error: "questions array is required" });
    return;
  }

  if (socialModeType === "set-answers-first" && (!hostAnswers || typeof hostAnswers !== "object")) {
    res.status(400).json({ error: "hostAnswers is required for set-answers-first mode" });
    return;
  }

  const room = createRoom(questions, mode ?? "trivia", hostMode ?? "player", socialModeType, hostAnswers, quizSource);
  res.json({ roomCode: room.roomCode });
});

// GET /api/rooms/:roomCode
app.get("/api/rooms/:roomCode", (req, res) => {
  const room = getRoom(req.params.roomCode ?? "");
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  // Strip quiz (delivered question-by-question via socket) and server-only fields before sending to clients
  const { quiz: _quiz, usedQuestionTexts: _used, ...safeRoom } = room;
  res.json(safeRoom);
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected:    ${socket.id}`);
  registerHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
