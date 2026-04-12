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
export interface Room {
    roomCode: string;
    players: Player[];
    quiz: Question[];
    currentQuestionIndex: number;
    status: GameStatus;
}
export declare function createRoom(quiz: Question[]): Room;
export declare function joinRoom(roomCode: string, playerId: string, playerName: string): Room;
export declare function getRoom(roomCode: string): Room | undefined;
export declare function leaveRoom(roomCode: string, playerId: string): Room | undefined;
/** Returns the room code a socket is currently in, if any. */
export declare function findRoomByPlayer(playerId: string): Room | undefined;
//# sourceMappingURL=rooms.d.ts.map