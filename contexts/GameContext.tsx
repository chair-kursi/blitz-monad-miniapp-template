'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { PlayerData } from '@/lib/game/socket';

export type GameStatus = 'idle' | 'lobby' | 'countdown' | 'playing' | 'finished';

export interface Player extends PlayerData {
    progress: number;
    wpm: number;
}

export interface GameContextType {
    // User
    user: {
        fid: number;
        username: string;
        address: string;
    } | null;
    setUser: (user: { fid: number; username: string; address: string } | null) => void;

    // Game
    gameId: string | null;
    gameStatus: GameStatus;
    players: Player[];
    textToType: string;
    startTime: number | null;
    endTime: number | null;
    winner: Player | null;

    // Actions
    setGameId: (id: string | null) => void;
    setGameStatus: (status: GameStatus) => void;
    setPlayers: (players: Player[]) => void;
    addPlayer: (player: PlayerData) => void;
    removePlayer: (address: string) => void;
    updatePlayerProgress: (address: string, progress: number, wpm: number) => void;
    setTextToType: (text: string) => void;
    setStartTime: (time: number | null) => void;
    setEndTime: (time: number | null) => void;
    setWinner: (winner: Player | null) => void;
    resetGame: () => void;

    // Socket
    socket: Socket | null;
    setSocket: (socket: Socket | null) => void;
    connected: boolean;
    setConnected: (connected: boolean) => void;
    authenticated: boolean;
    setAuthenticated: (authenticated: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<GameContextType['user']>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
    const [players, setPlayers] = useState<Player[]>([]);
    const [textToType, setTextToType] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [winner, setWinner] = useState<Player | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    const addPlayer = useCallback((player: PlayerData) => {
        setPlayers((prev) => {
            if (prev.some((p) => p.address === player.address)) {
                return prev;
            }
            return [...prev, { ...player, progress: 0, wpm: 0 }];
        });
    }, []);

    const removePlayer = useCallback((address: string) => {
        setPlayers((prev) => prev.filter((p) => p.address !== address));
    }, []);

    const updatePlayerProgress = useCallback((address: string, progress: number, wpm: number) => {
        setPlayers((prev) =>
            prev.map((p) => (p.address === address ? { ...p, progress, wpm } : p))
        );
    }, []);

    const resetGame = useCallback(() => {
        setGameId(null);
        setGameStatus('idle');
        setPlayers([]);
        setTextToType('');
        setStartTime(null);
        setEndTime(null);
        setWinner(null);
    }, []);

    const value: GameContextType = {
        user,
        setUser,
        gameId,
        gameStatus,
        players,
        textToType,
        startTime,
        endTime,
        winner,
        setGameId,
        setGameStatus,
        setPlayers,
        addPlayer,
        removePlayer,
        updatePlayerProgress,
        setTextToType,
        setStartTime,
        setEndTime,
        setWinner,
        resetGame,
        socket,
        setSocket,
        connected,
        setConnected,
        authenticated,
        setAuthenticated,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
