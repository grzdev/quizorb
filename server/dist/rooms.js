const rooms = new Map();
function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
export function createRoom(quiz, mode = "trivia", hostMode = "player", socialModeType, hostAnswers, quizSource) {
    let roomCode;
    do {
        roomCode = generateRoomCode();
    } while (rooms.has(roomCode));
    const room = {
        roomCode,
        players: [],
        quiz,
        currentQuestionIndex: 0,
        status: "lobby",
        mode,
        hostMode,
        usedQuestionTexts: new Set(),
        ...(quizSource !== undefined && { quizSource }),
        ...(socialModeType !== undefined && {
            socialModeType,
            hostAnswers: socialModeType === "set-answers-first" ? (hostAnswers ?? {}) : {},
        }),
    };
    rooms.set(roomCode, room);
    return room;
}
export function joinRoom(roomCode, playerId, playerName) {
    const room = rooms.get(roomCode);
    if (!room)
        throw new Error(`Room "${roomCode}" not found`);
    if (room.status !== "lobby")
        throw new Error("Game has already started");
    const existing = room.players.find((p) => p.name === playerName);
    if (existing) {
        if (existing.connected) {
            throw new Error(`Name "${playerName}" is already taken in this room`);
        }
        // Disconnected player reconnecting — restore their slot
        existing.id = playerId;
        existing.connected = true;
        return room;
    }
    room.players.push({ id: playerId, name: playerName, score: 0, connected: true });
    return room;
}
export function getRoom(roomCode) {
    return rooms.get(roomCode);
}
export function leaveRoom(roomCode, playerId) {
    const room = rooms.get(roomCode);
    if (!room)
        return undefined;
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0 && !room.hostSocketId) {
        rooms.delete(roomCode);
        return undefined;
    }
    return room;
}
/** Reset a room to lobby state so the same room can be replayed safely. */
export function resetRoomForReplay(room) {
    room.status = "lobby";
    room.currentQuestionIndex = 0;
    delete room.targetPlayerId;
    room.players = room.players.filter((p) => p.connected);
    room.players.forEach((p) => {
        p.score = 0;
    });
    return room;
}
/** Mark a connected socket as disconnected without removing the room immediately. */
export function markPlayerDisconnected(roomCode, socketId) {
    const room = rooms.get(roomCode);
    if (!room)
        return undefined;
    const player = room.players.find((p) => p.id === socketId);
    if (player)
        player.connected = false;
    if (room.hostSocketId === socketId) {
        delete room.hostSocketId;
    }
    const hasConnectedPlayer = room.players.some((p) => p.connected);
    const hasConnectedHost = room.hostSocketId !== undefined;
    // If no connected players or host remain, clean up the room.
    if (!hasConnectedPlayer && !hasConnectedHost) {
        rooms.delete(roomCode);
        return undefined;
    }
    return room;
}
/** Returns the room a socket is currently associated with, if any. */
export function findRoomByPlayer(playerId) {
    for (const room of rooms.values()) {
        if (room.hostSocketId === playerId || room.players.some((p) => p.id === playerId))
            return room;
    }
    return undefined;
}
//# sourceMappingURL=rooms.js.map