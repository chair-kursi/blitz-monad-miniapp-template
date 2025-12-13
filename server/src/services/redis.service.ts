import { Redis } from "@upstash/redis";
import { env } from "../config/env";
import { GameState, Player } from "../types";

class RedisService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            url: env.UPSTASH_REDIS_REST_URL,
            token: env.UPSTASH_REDIS_REST_TOKEN,
        });
    }

    // Game State Management
    async saveGameState(gameId: string, state: GameState): Promise<void> {
        const serializedState = {
            ...state,
            players: Array.from(state.players.entries()),
        };
        await this.redis.set(`game:${gameId}`, JSON.stringify(serializedState), {
            ex: 3600, // Expire after 1 hour
        });
    }

    async getGameState(gameId: string): Promise<GameState | null> {
        const data = await this.redis.get(`game:${gameId}`);
        if (!data) return null;

        const parsed = data as any;
        return {
            ...parsed,
            players: new Map(parsed.players),
        };
    }

    async deleteGameState(gameId: string): Promise<void> {
        await this.redis.del(`game:${gameId}`);
    }

    // Player Session Management
    async savePlayerSession(
        socketId: string,
        player: Player
    ): Promise<void> {
        await this.redis.set(`player:${socketId}`, JSON.stringify(player), {
            ex: 3600,
        });
    }

    async getPlayerSession(socketId: string): Promise<Player | null> {
        const data = await this.redis.get(`player:${socketId}`);
        return data as Player | null;
    }

    async deletePlayerSession(socketId: string): Promise<void> {
        await this.redis.del(`player:${socketId}`);
    }

    // Active Games List
    async addActiveGame(gameId: string): Promise<void> {
        await this.redis.sadd("active_games", gameId);
    }

    async removeActiveGame(gameId: string): Promise<void> {
        await this.redis.srem("active_games", gameId);
    }

    async getActiveGames(): Promise<string[]> {
        const games = await this.redis.smembers("active_games");
        return games as string[];
    }

    // Payment Verification Cache
    async cachePaymentVerification(
        gameId: string,
        address: string,
        verified: boolean
    ): Promise<void> {
        await this.redis.set(
            `payment:${gameId}:${address}`,
            verified ? "1" : "0",
            { ex: 3600 }
        );
    }

    async getPaymentVerification(
        gameId: string,
        address: string
    ): Promise<boolean | null> {
        const result = await this.redis.get<string>(`payment:${gameId}:${address}`);
        if (result === null) return null;
        return result === "1";
    }
}

export const redisService = new RedisService();
