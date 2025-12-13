import { Server } from "socket.io";
export declare class TournamentEngine {
    private io;
    private games;
    private socketToPlayer;
    private socketToGame;
    constructor(io: Server);
    private setupSocketHandlers;
    private handleAuthenticate;
    /**
     * Centralized method to add a player to a game.
     * Handles updating state, redis, socket rooms, notifications, and auto-starting.
     */
    private addPlayerToGame;
    private handlePlayNow;
    private handleCreateGame;
    private handleJoinGame;
    private startGame;
    private handleTypingProgress;
    private endGame;
    private handleLeaveGame;
    private handleDisconnect;
    private generateGameId;
}
//# sourceMappingURL=TournamentEngine.d.ts.map