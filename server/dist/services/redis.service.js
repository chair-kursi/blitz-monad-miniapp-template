"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = require("@upstash/redis");
const env_1 = require("../config/env");
class RedisService {
    redis;
    constructor() {
        this.redis = new redis_1.Redis({
            url: env_1.env.UPSTASH_REDIS_REST_URL,
            token: env_1.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    // Game State Management
    async saveGameState(gameId, state) {
        const serializedState = {
            ...state,
            players: Array.from(state.players.entries()),
        };
        await this.redis.set(`game:${gameId}`, JSON.stringify(serializedState), {
            ex: 3600, // Expire after 1 hour
        });
    }
    async getGameState(gameId) {
        const data = await this.redis.get(`game:${gameId}`);
        if (!data)
            return null;
        const parsed = data;
        return {
            ...parsed,
            players: new Map(parsed.players),
        };
    }
    async deleteGameState(gameId) {
        await this.redis.del(`game:${gameId}`);
    }
    // Player Session Management
    async savePlayerSession(socketId, player) {
        await this.redis.set(`player:${socketId}`, JSON.stringify(player), {
            ex: 3600,
        });
    }
    async getPlayerSession(socketId) {
        const data = await this.redis.get(`player:${socketId}`);
        return data;
    }
    async deletePlayerSession(socketId) {
        await this.redis.del(`player:${socketId}`);
    }
    // Active Games List
    async addActiveGame(gameId) {
        await this.redis.sadd("active_games", gameId);
    }
    async removeActiveGame(gameId) {
        await this.redis.srem("active_games", gameId);
    }
    async getActiveGames() {
        const games = await this.redis.smembers("active_games");
        return games;
    }
    // Payment Verification Cache
    async cachePaymentVerification(gameId, address, verified) {
        await this.redis.set(`payment:${gameId}:${address}`, verified ? "1" : "0", { ex: 3600 });
    }
    async getPaymentVerification(gameId, address) {
        const result = await this.redis.get(`payment:${gameId}:${address}`);
        if (result === null)
            return null;
        return result === "1";
    }
    // Generic Redis Operations (for matchmaking)
    async set(key, value, ttl) {
        if (ttl) {
            await this.redis.set(key, JSON.stringify(value), { ex: ttl });
        }
        else {
            await this.redis.set(key, JSON.stringify(value));
        }
    }
    async get(key) {
        const data = await this.redis.get(key);
        if (!data)
            return null;
        return data;
    }
    async delete(key) {
        await this.redis.del(key);
    }
    async keys(pattern) {
        return await this.redis.keys(pattern);
    }
}
exports.redisService = new RedisService();
//# sourceMappingURL=redis.service.js.map