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
    connected: boolean;
}
export type GameStatus = "lobby" | "question" | "leaderboard" | "finished";
export type RoomMode = "trivia" | "wkmb" | "hotseat" | "custom";
export type HostMode = "player" | "spectate";
export type SocialModeType = "quick-play" | "set-answers-first";
export type QuizSourceType = "default-topic" | "social-pack" | "groq-topic" | "file" | "custom";
export interface QuizSource {
    type: QuizSourceType;
    /** Topic string for default-topic and groq-topic sources */
    topic?: string;
    /** Pack ID for social-pack sources */
    packId?: string;
    /** Number of questions requested */
    count: number;
}
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
    /** Metadata about how the quiz was sourced, used for Play Again regeneration */
    quizSource?: QuizSource;
    /** Normalised question texts used across previous rounds — avoids repeats */
    usedQuestionTexts: Set<string>;
}
export declare function createRoom(quiz: Question[], mode?: RoomMode, hostMode?: HostMode, socialModeType?: SocialModeType, hostAnswers?: Record<string, number>, quizSource?: QuizSource): Room;
export declare function joinRoom(roomCode: string, playerId: string, playerName: string): Room;
export declare function getRoom(roomCode: string): Room | undefined;
export declare function leaveRoom(roomCode: string, playerId: string): Room | undefined;
/** Mark a player as disconnected without removing them from the room. */
export declare function markPlayerDisconnected(roomCode: string, playerId: string): Room | undefined;
/** Returns the room code a socket is currently in, if any. */
export declare function findRoomByPlayer(playerId: string): Room | undefined;
//# sourceMappingURL=rooms.d.ts.map