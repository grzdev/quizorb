import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerHandlers } from "./handlers.js";
import { generateQuiz } from "./quiz.js";
import { createRoom, getRoom } from "./rooms.js";
const PORT = 4000;
const CLIENT_ORIGIN = "http://localhost:5173";
const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
// POST /api/quizzes/generate
app.post("/api/quizzes/generate", (req, res) => {
    const { topic, count } = req.body;
    if (!topic || !count) {
        res.status(400).json({ error: "topic and count are required" });
        return;
    }
    try {
        const questions = generateQuiz(topic, Number(count));
        res.json({ questions });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /api/rooms/create
app.post("/api/rooms/create", (req, res) => {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        res.status(400).json({ error: "questions array is required" });
        return;
    }
    const room = createRoom(questions);
    res.json({ roomCode: room.roomCode });
});
// GET /api/rooms/:roomCode
app.get("/api/rooms/:roomCode", (req, res) => {
    const room = getRoom(req.params.roomCode ?? "");
    if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
    }
    // Strip quiz (delivered question-by-question via socket) before sending to clients
    const { quiz: _quiz, ...safeRoom } = room;
    res.json(safeRoom);
});
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_ORIGIN,
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
    console.log(`Server listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map