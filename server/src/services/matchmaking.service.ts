import { redisService } from './redis.service';
import { Player } from '../types';

interface WaitingPlayer {
    address: string;
    username: string;
    fid: number;
    socketId: string;
    joinedAt: number;
}

class MatchmakingService {
    private readonly QUEUE_PREFIX = 'matchmaking:player:';
    private readonly QUEUE_LIST = 'matchmaking:queue';

    /**
     * Add player to matchmaking queue
     */
    async addToQueue(player: Player, socketId: string): Promise<WaitingPlayer | null> {
        const waitingPlayer: WaitingPlayer = {
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
        await redisService.set(
            `${this.QUEUE_PREFIX}${player.address}`,
            waitingPlayer,
            300 // 5 minutes TTL
        );

        console.log(`🔍 Added ${player.username} to matchmaking queue`);
        return null;
    }

    /**
     * Find an opponent (first-come-first-served)
     */
    private async findOpponent(excludeAddress: string): Promise<WaitingPlayer | null> {
        // Get all waiting players
        const keys = await redisService.keys(`${this.QUEUE_PREFIX}*`);

        if (!keys || keys.length === 0) {
            return null;
        }

        // Find oldest waiting player (not self)
        let oldestPlayer: WaitingPlayer | null = null;
        let oldestTime = Infinity;

        for (const key of keys) {
            const address = key.replace(this.QUEUE_PREFIX, '');
            if (address === excludeAddress) continue;

            const player = await redisService.get<WaitingPlayer>(key);

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
    async removeFromQueue(address: string): Promise<void> {
        await redisService.delete(`${this.QUEUE_PREFIX}${address}`);
        console.log(`❌ Removed ${address} from matchmaking queue`);
    }

    /**
     * Get queue size
     */
    async getQueueSize(): Promise<number> {
        const keys = await redisService.keys(`${this.QUEUE_PREFIX}*`);
        return keys ? keys.length : 0;
    }
}

export const matchmakingService = new MatchmakingService();
