"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchmakingService = void 0;
const redis_service_1 = require("./redis.service");
class MatchmakingService {
    QUEUE_PREFIX = 'matchmaking:player:';
    QUEUE_LIST = 'matchmaking:queue';
    /**
     * Add player to matchmaking queue
     */
    async addToQueue(player, socketId) {
        const waitingPlayer = {
            address: player.address,
            username: player.username,
            fid: player.fid,
            socketId,
            joinedAt: Date.now(),
        };
        // Check if there's already a waiting player
        const opponent = await this.findOpponent(player.address);
        if (opponent) {
            // Match found! Remove opponent from queue
            await this.removeFromQueue(opponent.address);
            return opponent;
        }
        // No opponent, add to queue
        await redis_service_1.redisService.set(`${this.QUEUE_PREFIX}${player.address}`, waitingPlayer, 300 // 5 minutes TTL
        );
        console.log(`🔍 Added ${player.username} to matchmaking queue`);
        return null;
    }
    /**
     * Find an opponent (first-come-first-served)
     */
    async findOpponent(excludeAddress) {
        // Get all waiting players
        const keys = await redis_service_1.redisService.keys(`${this.QUEUE_PREFIX}*`);
        if (!keys || keys.length === 0) {
            return null;
        }
        // Find oldest waiting player (not self)
        let oldestPlayer = null;
        let oldestTime = Infinity;
        for (const key of keys) {
            const address = key.replace(this.QUEUE_PREFIX, '');
            if (address === excludeAddress)
                continue;
            const player = await redis_service_1.redisService.get(key);
            if (player && player.joinedAt < oldestTime) {
                oldestTime = player.joinedAt;
                oldestPlayer = player;
            }
        }
        return oldestPlayer;
    }
    /**
     * Remove player from queue
     */
    async removeFromQueue(address) {
        await redis_service_1.redisService.delete(`${this.QUEUE_PREFIX}${address}`);
        console.log(`❌ Removed ${address} from matchmaking queue`);
    }
    /**
     * Get queue size
     */
    async getQueueSize() {
        const keys = await redis_service_1.redisService.keys(`${this.QUEUE_PREFIX}*`);
        return keys ? keys.length : 0;
    }
}
exports.matchmakingService = new MatchmakingService();
//# sourceMappingURL=matchmaking.service.js.map