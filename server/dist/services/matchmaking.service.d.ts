import { Player } from '../types';
interface WaitingPlayer {
    address: string;
    username: string;
    fid: number;
    socketId: string;
    joinedAt: number;
}
declare class MatchmakingService {
    private readonly QUEUE_PREFIX;
    private readonly QUEUE_LIST;
    /**
     * Add player to matchmaking queue
     */
    addToQueue(player: Player, socketId: string): Promise<WaitingPlayer | null>;
    /**
     * Find an opponent (first-come-first-served)
     */
    private findOpponent;
    /**
     * Remove player from queue
     */
    removeFromQueue(address: string): Promise<void>;
    /**
     * Get queue size
     */
    getQueueSize(): Promise<number>;
}
export declare const matchmakingService: MatchmakingService;
export {};
//# sourceMappingURL=matchmaking.service.d.ts.map