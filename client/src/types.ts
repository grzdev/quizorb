// Mirrors the server-side Room / Player shapes (without server-only fields)

export interface QuestionPayload {
  questionId: number;
  text: string;
  options: string[];
  timeLimit: number; // seconds
  /** Hot Seat mode: the player currently being guessed */
  targetPlayerId?: string;
  targetPlayerName?: string;
}

/** Shape returned by POST /api/quizzes/generate */
export interface GeneratedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}

export type Topic =
  | "science"
  | "history"
  | "technology"
  | "geography"
  | "movies"
  | "music"
  | "sports"
  | "food"
  | "anime"
  | "gaming"
  | "pop-culture"
  | "nature";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export type GameStatus = "lobby" | "question" | "leaderboard" | "finished";

export type RoomMode = "trivia" | "wkmb" | "hotseat" | "custom";

export type SocialModeType = "quick-play" | "set-answers-first";

export interface AnswersProgress {
  questionId: number;
  answered: number;
  total: number;
  optionCounts: number[];
  optionVoters: string[][];
}

export type SocialPackId = "wkmb";

export interface PackMeta {
  id: SocialPackId;
  name: string;
  description: string;
}

export type HostMode = "player" | "spectate";

export interface Room {
  roomCode: string;
  players: Player[];
  currentQuestionIndex: number;
  status: GameStatus;
  mode: RoomMode;
  hostMode: HostMode;
  socialModeType?: SocialModeType;
  targetPlayerId?: string;
}
