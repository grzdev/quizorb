export interface Question {
  text: string;
  options: string[];
  correctIndex: number;
  /** Seconds players have to answer. Default: 20 */
  timeLimit: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export type GameStatus = "lobby" | "question" | "leaderboard" | "finished";

export type RoomMode = "trivia" | "wkmb" | "hotseat" | "custom";

export type HostMode = "player" | "spectate";

export type SocialModeType = "quick-play" | "set-answers-first";

export interface Room {
  roomCode: string;
  players: Player[];
  quiz: Question[];
  currentQuestionIndex: number;
  status: GameStatus;
  mode: RoomMode;
  hostMode: HostMode;
  socialModeType?: SocialModeType;
  hostAnswers?: Record<string, number>;
  hostSocketId?: string;
  /** Hot Seat mode: the player currently in the hot seat */
  targetPlayerId?: string;
}

const rooms = new Map<string, Room>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(
  quiz: Question[],
  mode: RoomMode = "trivia",
  hostMode: HostMode = "player",
  socialModeType?: SocialModeType,
  hostAnswers?: Record<string, number>,
): Room {
  let roomCode: string;
  do {
    roomCode = generateRoomCode();
  } while (rooms.has(roomCode));

  const room: Room = {
    roomCode,
    players: [],
    quiz,
    currentQuestionIndex: 0,
    status: "lobby",
    mode,
    hostMode,
    ...(socialModeType !== undefined && {
      socialModeType,
      hostAnswers: socialModeType === "set-answers-first" ? (hostAnswers ?? {}) : {},
    }),
  };

  rooms.set(roomCode, room);
  return room;
}

export function joinRoom(
  roomCode: string,
  playerId: string,
  playerName: string,
): Room {
  const room = rooms.get(roomCode);
  if (!room) throw new Error(`Room "${roomCode}" not found`);
  if (room.status !== "lobby") throw new Error("Game has already started");
  if (room.players.some((p) => p.name === playerName)) {
    throw new Error(`Name "${playerName}" is already taken in this room`);
  }

  room.players.push({ id: playerId, name: playerName, score: 0 });
  return room;
}

export function getRoom(roomCode: string): Room | undefined {
  return rooms.get(roomCode);
}

export function leaveRoom(roomCode: string, playerId: string): Room | undefined {
  const room = rooms.get(roomCode);
  if (!room) return undefined;

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomCode);
    return undefined;
  }

  return room;
}

/** Returns the room code a socket is currently in, if any. */
export function findRoomByPlayer(playerId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p) => p.id === playerId)) return room;
  }
  return undefined;
}
