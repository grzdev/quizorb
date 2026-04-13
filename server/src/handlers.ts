import type { Server, Socket } from "socket.io";
import {
  findRoomByPlayer,
  getRoom,
  joinRoom,
  markPlayerDisconnected,
  resetRoomForReplay,
  type Question,
  type Room,
} from "./rooms.js";
import { calculateScore } from "./scoring.js";
import { getPackQuestions, type SocialPackId } from "./socialPacks.js";
import { generateGroqQuiz } from "./services/groqQuiz.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Broadcast the full room state to every socket in the room. */
function broadcastRoom(io: Server, room: Room): void {
  io.to(room.roomCode).emit("room:updated", room);
}

function clearRoomRoundState(roomCode: string): void {
  clearQuestionTimer(roomCode);
  questionStartTimes.delete(roomCode);

  const roomPrefix = `${roomCode}:`;
  for (const key of answeredMap.keys()) {
    if (key.startsWith(roomPrefix)) answeredMap.delete(key);
  }
  for (const key of liveHostAnswerMap.keys()) {
    if (key.startsWith(roomPrefix)) liveHostAnswerMap.delete(key);
  }
  for (const key of pendingAnswerMap.keys()) {
    if (key.startsWith(roomPrefix)) pendingAnswerMap.delete(key);
  }
}

/** Strip correctIndex from questions before sending to clients. */
function sanitizeQuestion(room: Room) {
  const q = room.quiz[room.currentQuestionIndex];
  if (!q) return null;
  const base = {
    questionId: room.currentQuestionIndex,
    text: q.text,
    options: q.options,
    timeLimit: q.timeLimit,
  };
  if (room.mode === "hotseat" && room.targetPlayerId) {
    const target = room.players.find((p) => p.id === room.targetPlayerId);
    return { ...base, targetPlayerId: room.targetPlayerId, targetPlayerName: target?.name ?? "?" };
  }
  return base;
}

// ---------------------------------------------------------------------------
// Per-socket handler
// ---------------------------------------------------------------------------

export function registerHandlers(io: Server, socket: Socket): void {
  // ── room:join ─────────────────────────────────────────────────────────────
  socket.on(
    "room:join",
    (
      payload: { roomCode: string; playerName: string },
      callback?: (res: { error?: string; room?: Room }) => void,
    ) => {
      try {
        const { roomCode, playerName } = payload;
        const room = joinRoom(roomCode, socket.id, playerName);
        socket.join(roomCode);
        broadcastRoom(io, room);
        callback?.({ room });
      } catch (err) {
        callback?.({ error: (err as Error).message });
      }
    },
  );

  // ── host:join (spectate — joins socket room without adding a player) ───────
  socket.on(
    "host:join",
    (
      payload: { roomCode: string },
      callback?: (res: { error?: string; room?: Room }) => void,
    ) => {
      const room = getRoom(payload.roomCode);
      if (!room) {
        callback?.({ error: `Room "${payload.roomCode}" not found` });
        return;
      }
      socket.join(payload.roomCode);
      room.hostSocketId = socket.id;
      callback?.({ room });
    },
  );

  // ── game:start ────────────────────────────────────────────────────────────
  socket.on("game:start", (payload: { roomCode: string }) => {
    const room = getRoom(payload.roomCode);
    if (!room || room.status !== "lobby") return;

    room.status = "question";
    room.currentQuestionIndex = 0;

    // Hot Seat: initialise the first target player (rotate each question)
    if (room.mode === "hotseat" && room.players.length > 0) {
      room.targetPlayerId = room.players[0]!.id;
    }

    recordQuestionStart(io, room);

    io.to(room.roomCode).emit("question:started", sanitizeQuestion(room));
    broadcastRoom(io, room);
  });

  // ── answer:submit ─────────────────────────────────────────────────────────
  socket.on(
    "answer:submit",
    (payload: { roomCode: string; questionId: number; selectedIndex: number }) => {
      const { roomCode, questionId, selectedIndex } = payload;
      const room = getRoom(roomCode);
      if (!room || room.status !== "question") return;
      if (room.currentQuestionIndex !== questionId) return;

      const question: Question | undefined = room.quiz[questionId];
      if (!question) return;

      const key = `${roomCode}:${questionId}`;
      const isQuickPlay = room.socialModeType === "quick-play";

      function emitProgress(answered: Map<string, number>) {        const optionCounts = new Array<number>(question!.options.length).fill(0);
        const optionVoters: string[][] = question!.options.map(() => []);
        for (const [pid, idx] of answered.entries()) {
          if (idx >= 0 && idx < optionCounts.length) {
            optionCounts[idx] = (optionCounts[idx] ?? 0) + 1;
            const name = room!.players.find((p) => p.id === pid)?.name ?? "";
            if (name) optionVoters[idx]!.push(name);
          }
        }
        io.to(roomCode).emit("answers:progress", {
          questionId,
          answered: answered.size,
          total: room!.players.filter((p) => p.connected).length,
          optionCounts,
          optionVoters,
        });
      }

      // ── Hot Seat mode ────────────────────────────────────────────────────────
      if (room.mode === "hotseat") {
        const nonTargetPlayers = room.players.filter((p) => p.id !== room.targetPlayerId && p.connected);

        // Target player submitting — their answer becomes the truth
        if (socket.id === room.targetPlayerId) {
          liveHostAnswerMap.set(key, selectedIndex);

          const pending = pendingAnswerMap.get(key);
          if (pending) {
            for (const [playerId, { selectedIndex: pIdx, timeTaken: pTime }] of pending) {
              const player = room.players.find((p) => p.id === playerId);
              if (!player) continue;
              player.score += calculateScore(pIdx === selectedIndex, pTime, question.timeLimit);
            }
            pendingAnswerMap.delete(key);
          }

          const answered = answeredMap.get(key) ?? new Map<string, number>();
          answered.set(socket.id, selectedIndex);
          answeredMap.set(key, answered);
          emitProgress(answered);

          const allNonTargetAnswered = nonTargetPlayers.every((p) => answered.has(p.id));
          if (allNonTargetAnswered) {
            clearQuestionTimer(roomCode);
            liveHostAnswerMap.delete(key);
            answeredMap.delete(key);
            advanceQuestion(io, room);
          }
          return;
        }

        // Non-target player submitting — guess against the target's answer
        const player = room.players.find((p) => p.id === socket.id);
        if (!player) return;

        const timeTaken = getTimeTaken(room);
        const answered = answeredMap.get(key) ?? new Map<string, number>();
        answered.set(socket.id, selectedIndex);
        answeredMap.set(key, answered);

        const targetAnswer = liveHostAnswerMap.get(key);
        if (targetAnswer !== undefined) {
          player.score += calculateScore(selectedIndex === targetAnswer, timeTaken, question.timeLimit);
        } else {
          const pending = pendingAnswerMap.get(key) ?? new Map<string, { selectedIndex: number; timeTaken: number }>();
          pending.set(socket.id, { selectedIndex, timeTaken });
          pendingAnswerMap.set(key, pending);
        }

        emitProgress(answered);

        const allNonTargetAnswered = nonTargetPlayers.every((p) => answered.has(p.id));
        if (allNonTargetAnswered && liveHostAnswerMap.has(key)) {
          clearQuestionTimer(roomCode);
          liveHostAnswerMap.delete(key);
          answeredMap.delete(key);
          advanceQuestion(io, room);
        }
        return;
      }

      // ── Quick-play: host submits their answer — becomes the truth ────────────
      if (isQuickPlay && socket.id === room.hostSocketId) {
        liveHostAnswerMap.set(key, selectedIndex);

        const pending = pendingAnswerMap.get(key);
        if (pending) {
          for (const [playerId, { selectedIndex: pIdx, timeTaken: pTime }] of pending) {
            const player = room.players.find((p) => p.id === playerId);
            if (!player) continue;
            player.score += calculateScore(pIdx === selectedIndex, pTime, question.timeLimit);
          }
          pendingAnswerMap.delete(key);
        }

        const answered = answeredMap.get(key) ?? new Map<string, number>();
        emitProgress(answered);

        const allPlayersAnswered = room.players.filter((p) => p.connected).every((p) => answered.has(p.id));
        if (allPlayersAnswered) {
          clearQuestionTimer(roomCode);
          liveHostAnswerMap.delete(key);
          answeredMap.delete(key);
          advanceQuestion(io, room);
        }
        return;
      }

      // ── Quick-play: regular player submits answer ────────────────────────────
      if (isQuickPlay) {
        const player = room.players.find((p) => p.id === socket.id);
        if (!player) return;

        const timeTaken = getTimeTaken(room);
        const answered = answeredMap.get(key) ?? new Map<string, number>();
        answered.set(socket.id, selectedIndex);
        answeredMap.set(key, answered);

        const hostAnswer = liveHostAnswerMap.get(key);
        if (hostAnswer !== undefined) {
          player.score += calculateScore(selectedIndex === hostAnswer, timeTaken, question.timeLimit);
        } else {
          const pending = pendingAnswerMap.get(key) ?? new Map<string, { selectedIndex: number; timeTaken: number }>();
          pending.set(socket.id, { selectedIndex, timeTaken });
          pendingAnswerMap.set(key, pending);
        }

        emitProgress(answered);

        const allPlayersAnswered = room.players.filter((p) => p.connected).every((p) => answered.has(p.id));
        if (allPlayersAnswered && liveHostAnswerMap.has(key)) {
          clearQuestionTimer(roomCode);
          liveHostAnswerMap.delete(key);
          answeredMap.delete(key);
          advanceQuestion(io, room);
        }
        return;
      }

      // ── Standard / set-answers-first: score on submission ───────────────────
      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      const correctIndex =
        room.socialModeType === "set-answers-first" && room.hostAnswers !== undefined
          ? (room.hostAnswers[String(questionId)] ?? question.correctIndex)
          : question.correctIndex;

      const timeTaken = getTimeTaken(room);
      player.score += calculateScore(selectedIndex === correctIndex, timeTaken, question.timeLimit);

      const answered = answeredMap.get(key) ?? new Map<string, number>();
      answered.set(socket.id, selectedIndex);
      answeredMap.set(key, answered);

      emitProgress(answered);

      const allAnswered = room.players.filter((p) => p.connected).every((p) => answered.has(p.id));
      if (!allAnswered) return;

      clearQuestionTimer(roomCode);
      answeredMap.delete(key);
      advanceQuestion(io, room);
    },
  );

  // ── room:reset ────────────────────────────────────────────────────────────
  socket.on("room:reset", (payload: { roomCode: string }) => {
    void (async () => {
      const room = getRoom(payload.roomCode);
      if (!room) return;

      clearRoomRoundState(room.roomCode);

      // Archive the current round's questions so next round avoids them
      const normalise = (t: string) => t.toLowerCase().trim();
      for (const q of room.quiz) {
        room.usedQuestionTexts.add(normalise(q.text));
      }

      // Attempt fresh quiz generation for replayable sources
      if (room.quizSource) {
        const { type, topic, packId, count, difficulty } = room.quizSource;
        try {
          let fresh: Question[] | null = null;
          if (type === "default-topic" && topic) {
            fresh = await generateGroqQuiz(topic, count, difficulty ?? "medium");
          } else if (type === "social-pack" && packId) {
            fresh = getPackQuestions(packId as SocialPackId, count, room.usedQuestionTexts);
          } else if (type === "groq-topic" && topic) {
            // Groq regeneration is inherently varied — LLM avoids repeats naturally
            fresh = await generateGroqQuiz(topic, count, difficulty ?? "medium");
          }
          if (fresh && fresh.length > 0) {
            room.quiz = fresh;
          }
        } catch (err) {
          console.error("[room:reset] quiz regeneration failed, keeping existing quiz:", (err as Error).message);
        }
      }

      resetRoomForReplay(room);
      broadcastRoom(io, room);
    })();
  });

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const room = findRoomByPlayer(socket.id);
    if (!room) return;

    const { roomCode } = room;
    const updatedRoom = markPlayerDisconnected(roomCode, socket.id);

    if (updatedRoom) {
      broadcastRoom(io, updatedRoom);
    }
  });
}

// ---------------------------------------------------------------------------
// Internal game logic
// ---------------------------------------------------------------------------

/** Tracks which players have answered each question and which option they chose:
 * "roomCode:questionId" -> Map<playerId, selectedIndex> */
const answeredMap = new Map<string, Map<string, number>>();

/** Quick-play social: host's live answer per question.
 * "roomCode:questionId" -> selectedIndex */
const liveHostAnswerMap = new Map<string, number>();

/** Quick-play social: player answers buffered until the host submits.
 * "roomCode:questionId" -> Map<playerId, { selectedIndex, timeTaken }> */
const pendingAnswerMap = new Map<string, Map<string, { selectedIndex: number; timeTaken: number }>>();

/** Unix ms timestamp of when the current question was shown: roomCode -> startTime */
const questionStartTimes = new Map<string, number>();

/** Server-side deadline timer per room — fires when time runs out regardless of answers */
const questionTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearQuestionTimer(roomCode: string): void {
  const existing = questionTimers.get(roomCode);
  if (existing !== undefined) {
    clearTimeout(existing);
    questionTimers.delete(roomCode);
  }
}

function recordQuestionStart(io: Server, room: Room): void {
  const questionIndex = room.currentQuestionIndex;
  const question = room.quiz[questionIndex];
  if (!question) return;

  questionStartTimes.set(room.roomCode, Date.now());

  // Deadline: force progression when time runs out, even if not all players answered.
  clearQuestionTimer(room.roomCode);
  const timer = setTimeout(() => {
    questionTimers.delete(room.roomCode);

    // Guard: room may have already advanced (e.g. all players answered in time)
    if (room.status !== "question") return;
    if (room.currentQuestionIndex !== questionIndex) return;

    const key = `${room.roomCode}:${questionIndex}`;

    // Quick-play wkmb: if host answered in time, score any still-buffered players
    if (room.socialModeType === "quick-play") {
      const hostAnswer = liveHostAnswerMap.get(key);
      const q = room.quiz[questionIndex];
      if (hostAnswer !== undefined && q) {
        const pending = pendingAnswerMap.get(key);
        if (pending) {
          for (const [playerId, { selectedIndex, timeTaken }] of pending) {
            const player = room.players.find((p) => p.id === playerId);
            if (!player) continue;
            player.score += calculateScore(selectedIndex === hostAnswer, timeTaken, q.timeLimit);
          }
        }
      }
      liveHostAnswerMap.delete(key);
      pendingAnswerMap.delete(key);
    }

    // Hot Seat: score pending players if target answered in time; clear buffers
    if (room.mode === "hotseat") {
      const targetAnswer = liveHostAnswerMap.get(key);
      const q = room.quiz[questionIndex];
      if (targetAnswer !== undefined && q) {
        const pending = pendingAnswerMap.get(key);
        if (pending) {
          for (const [playerId, { selectedIndex, timeTaken }] of pending) {
            const player = room.players.find((p) => p.id === playerId);
            if (!player) continue;
            player.score += calculateScore(selectedIndex === targetAnswer, timeTaken, q.timeLimit);
          }
        }
      }
      liveHostAnswerMap.delete(key);
      pendingAnswerMap.delete(key);
    }

    answeredMap.delete(key);
    advanceQuestion(io, room);
  }, question.timeLimit * 1000);

  questionTimers.set(room.roomCode, timer);
}

function getTimeTaken(room: Room): number {
  const started = questionStartTimes.get(room.roomCode) ?? Date.now();
  return (Date.now() - started) / 1000; // seconds
}

function advanceQuestion(io: Server, room: Room): void {
  // Show leaderboard between questions
  room.status = "leaderboard";
  const sorted = [...room.players]
    .filter((p) => p.id !== room.hostSocketId)
    .sort((a, b) => b.score - a.score);
  io.to(room.roomCode).emit("leaderboard:updated", sorted);
  broadcastRoom(io, room);

  const isLastQuestion = room.currentQuestionIndex >= room.quiz.length - 1;

  setTimeout(() => {
    if (isLastQuestion) {
      room.status = "finished";
      io.to(room.roomCode).emit("game:finished", sorted);
    } else {
      room.currentQuestionIndex += 1;
      room.status = "question";

      // Hot Seat: rotate to the next target player
      if (room.mode === "hotseat" && room.players.length > 0) {
        const currentIdx = room.players.findIndex((p) => p.id === room.targetPlayerId);
        const nextIdx = (currentIdx + 1) % room.players.length;
        room.targetPlayerId = room.players[nextIdx]!.id;
      }

      recordQuestionStart(io, room);
      io.to(room.roomCode).emit("question:started", sanitizeQuestion(room));
    }
    broadcastRoom(io, room);
  }, 3000);
}
