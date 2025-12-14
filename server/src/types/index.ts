export interface Player {
    fid: number;
    username: string;
    address: string;
    socketId: string;
    progress: number; // 0-100
    wpm: number;
    hasPaid: boolean;
    joinedAt: number;
}

export interface GameState {
    gameId: string;
    status: "waiting" | "active" | "finished";
    players: Map<string, Player>; // address => Player
    maxPlayers: number;
    startTime?: number;
    endTime?: number;
    winner?: string; // winner address
    textToType: string;
    createdAt: number;
}

export interface TypingProgress {
    gameId: string; // NEW: Required for stateless updates
    address: string;
    progress: number; // 0-100
    wpm: number;
    timestamp: number;
}

export interface AuthPayload {
    fid: number;
    username: string;
    address: string;
}

export enum SocketEvents {
    // Client -> Server
    AUTHENTICATE = "authenticate",
    JOIN_GAME = "join_game",
    CREATE_GAME = "create_game",
    PLAY_NOW = "play_now", // NEW: Matchmaking
    TYPING_PROGRESS = "typing_progress",
    LEAVE_GAME = "leave_game",

    // Server -> Client
    AUTHENTICATED = "authenticated",
    GAME_CREATED = "game_created",
    GAME_JOINED = "game_joined",
    SEARCHING_OPPONENT = "searching_opponent", // NEW: Looking for match
    OPPONENT_FOUND = "opponent_found", // NEW: Match found
    GAME_STARTED = "game_started",
    PLAYER_JOINED = "player_joined",
    PLAYER_LEFT = "player_left",
    PROGRESS_UPDATE = "progress_update",
    GAME_FINISHED = "game_finished",
    ERROR = "error",
}
