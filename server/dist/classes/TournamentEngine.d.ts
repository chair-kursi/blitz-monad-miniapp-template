import { Server } from "socket.io";
export declare class TournamentEngine {
    private io;
    private games;
    private socketToPlayer;
    private socketToGame;
    constructor(io: Server);
    private setupSocketHandlers;
    private handleAuthenticate;
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