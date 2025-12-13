import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export interface SocketEvents {
    // Client → Server
    authenticate: (data: { token: string }) => void;
    create_game: () => void;
    join_game: (data: { gameId: string }) => void;
    typing_progress: (data: TypingProgress) => void;
    leave_game: () => void;

    // Server → Client
    authenticated: (data: AuthPayload) => void;
    game_created: (data: GameCreatedData) => void;
    game_joined: (data: GameJoinedData) => void;
    game_started: (data: GameStartedData) => void;
    player_joined: (data: PlayerData) => void;
    player_left: (data: PlayerData) => void;
    progress_update: (data: ProgressUpdate) => void;
    game_finished: (data: GameFinishedData) => void;
    error: (data: { message: string }) => void;
}

export interface AuthPayload {
    fid: number;
    username: string;
    address: string;
}

export interface TypingProgress {
    address: string;
    progress: number;
    wpm: number;
    timestamp: number;
}

export interface GameCreatedData {
    gameId: string;
    textToType: string;
    maxPlayers: number;
    entryFee: string;
}

export interface GameJoinedData {
    gameId: string;
    textToType: string;
    players: PlayerData[];
}

export interface GameStartedData {
    startTime: number;
    endTime: number;
    duration: number;
}

export interface PlayerData {
    username: string;
    address: string;
    fid?: number;
}

export interface ProgressUpdate {
    address: string;
    username: string;
    progress: number;
    wpm: number;
}

export interface GameFinishedData {
    winner: {
        username: string;
        address: string;
        progress: number;
        wpm: number;
    };
    txHash: string;
}

/**
 * Create Socket.IO client instance
 */
export function createSocket(): Socket {
    const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    return socket;
}

/**
 * Create authentication token for testing
 * In production, this would come from Farcaster SDK
 */
export function createAuthToken(fid: number, username: string, address: string): string {
    const payload = { fid, username, address };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}
