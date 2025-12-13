import { GameState, Player } from "../types";
declare class RedisService {
    private redis;
    constructor();
    saveGameState(gameId: string, state: GameState): Promise<void>;
    getGameState(gameId: string): Promise<GameState | null>;
    deleteGameState(gameId: string): Promise<void>;
    savePlayerSession(socketId: string, player: Player): Promise<void>;
    getPlayerSession(socketId: string): Promise<Player | null>;
    deletePlayerSession(socketId: string): Promise<void>;
    addActiveGame(gameId: string): Promise<void>;
    removeActiveGame(gameId: string): Promise<void>;
    getActiveGames(): Promise<string[]>;
    cachePaymentVerification(gameId: string, address: string, verified: boolean): Promise<void>;
    getPaymentVerification(gameId: string, address: string): Promise<boolean | null>;
}
export declare const redisService: RedisService;
export {};
//# sourceMappingURL=redis.service.d.ts.map