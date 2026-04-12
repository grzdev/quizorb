import { createRoom, findRoomByPlayer, getRoom, joinRoom, leaveRoom, } from "./rooms.js";
import { calculateScore } from "./scoring.js";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Broadcast the full room state to every socket in the room. */
function broadcastRoom(io, room) {
    io.to(room.roomCode).emit("room:updated", room);
}
/** Strip correctIndex from questions before sending to clients. */
function sanitizeQuestion(room) {
    const q = room.quiz[room.currentQuestionIndex];
    if (!q)
        return null;
    return {
        questionId: room.currentQuestionIndex,
        text: q.text,
        options: q.options,
        timeLimit: q.timeLimit,
    };
}
// ---------------------------------------------------------------------------
// Per-socket handler
// ---------------------------------------------------------------------------
export function registerHandlers(io, socket) {
    // ── room:join ─────────────────────────────────────────────────────────────
    socket.on("room:join", (payload, callback) => {
        try {
            const { roomCode, playerName } = payload;
            const room = joinRoom(roomCode, socket.id, playerName);
            socket.join(roomCode);
            broadcastRoom(io, room);
            callback?.({ room });
        }
        catch (err) {
            callback?.({ error: err.message });
        }
    });
    // ── game:start ────────────────────────────────────────────────────────────
    socket.on("game:start", (payload) => {
        const room = getRoom(payload.roomCode);
        if (!room || room.status !== "lobby")
            return;
        room.status = "question";
        room.currentQuestionIndex = 0;
        recordQuestionStart(room);
        io.to(room.roomCode).emit("question:started", sanitizeQuestion(room));
        broadcastRoom(io, room);
    });
    // ── answer:submit ─────────────────────────────────────────────────────────
    socket.on("answer:submit", (payload) => {
        const { roomCode, questionId, selectedIndex } = payload;
        const room = getRoom(roomCode);
        if (!room || room.status !== "question")
            return;
        if (room.currentQuestionIndex !== questionId)
            return;
        const question = room.quiz[questionId];
        if (!question)
            return;
        const player = room.players.find((p) => p.id === socket.id);
        if (!player)
            return;
        // Score the answer
        const timeTaken = getTimeTaken(room);
        const awardedPoints = calculateScore(selectedIndex === question.correctIndex, timeTaken, question.timeLimit);
        player.score += awardedPoints;
        // Track that this player has answered
        const key = `${roomCode}:${questionId}`;
        const answered = answeredMap.get(key) ?? new Set();
        answered.add(socket.id);
        answeredMap.set(key, answered);
        const allAnswered = room.players.every((p) => answered.has(p.id));
        if (!allAnswered)
            return;
        // Clean up tracking for this question
        answeredMap.delete(key);
        advanceQuestion(io, room);
    });
    // ── disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
        const room = findRoomByPlayer(socket.id);
        if (!room)
            return;
        const { roomCode } = room;
        const updatedRoom = leaveRoom(roomCode, socket.id);
        if (updatedRoom) {
            broadcastRoom(io, updatedRoom);
        }
    });
}
// ---------------------------------------------------------------------------
// Internal game logic
// ---------------------------------------------------------------------------
/** Tracks which players have answered each question: "roomCode:questionId" -> Set<playerId> */
const answeredMap = new Map();
/** Unix ms timestamp of when the current question was shown: roomCode -> startTime */
const questionStartTimes = new Map();
function recordQuestionStart(room) {
    questionStartTimes.set(room.roomCode, Date.now());
}
function getTimeTaken(room) {
    const started = questionStartTimes.get(room.roomCode) ?? Date.now();
    return (Date.now() - started) / 1000; // seconds
}
function advanceQuestion(io, room) {
    // Show leaderboard between questions
    room.status = "leaderboard";
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    io.to(room.roomCode).emit("leaderboard:updated", sorted);
    broadcastRoom(io, room);
    const isLastQuestion = room.currentQuestionIndex >= room.quiz.length - 1;
    setTimeout(() => {
        if (isLastQuestion) {
            room.status = "finished";
            io.to(room.roomCode).emit("game:finished", sorted);
        }
        else {
            room.currentQuestionIndex += 1;
            room.status = "question";
            recordQuestionStart(room);
            io.to(room.roomCode).emit("question:started", sanitizeQuestion(room));
        }
        broadcastRoom(io, room);
    }, 3000);
}
//# sourceMappingURL=handlers.js.map