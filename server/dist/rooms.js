const rooms = new Map();
function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
export function createRoom(quiz) {
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
    if (room.players.some((p) => p.name === playerName)) {
        throw new Error(`Name "${playerName}" is already taken in this room`);
    }
    room.players.push({ id: playerId, name: playerName, score: 0 });
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
    if (room.players.length === 0) {
        rooms.delete(roomCode);
        return undefined;
    }
    return room;
}
/** Returns the room code a socket is currently in, if any. */
export function findRoomByPlayer(playerId) {
    for (const room of rooms.values()) {
        if (room.players.some((p) => p.id === playerId))
            return room;
    }
    return undefined;
}
//# sourceMappingURL=rooms.js.map