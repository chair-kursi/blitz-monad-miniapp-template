'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useTyping } from '@/hooks/useTyping';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap } from 'lucide-react';
import { throttle } from '@/lib/game/utils';
import { getCharacterStatus } from '@/lib/game/typing-utils';

export function TypingGame() {
    const {
        textToType,
        players,
        user,
        socket,
        gameStatus,
        setGameStatus,
        updatePlayerProgress,
        setWinner,
    } = useGame();

    const [countdown, setCountdown] = useState(3);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [gameStarted, setGameStarted] = useState(false);

    // Throttled progress update
    const emitProgress = useCallback(
        throttle((progress: number, wpm: number) => {
            if (socket && user) {
                socket.emit('typing_progress', {
                    address: user.address,
                    progress,
                    wpm,
                    timestamp: Date.now(),
                });
            }
        }, 500),
        [socket, user]
    );

    const { typedText, progress, wpm, handleInput, reset } = useTyping(
        textToType,
        emitProgress
    );

    // Countdown logic
    useEffect(() => {
        if (gameStatus === 'countdown' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (gameStatus === 'countdown' && countdown === 0) {
            setGameStatus('playing');
            setGameStarted(true);
        }
    }, [gameStatus, countdown, setGameStatus]);

    // Game timer
    useEffect(() => {
        if (gameStatus === 'playing' && timeRemaining > 0) {
            const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [gameStatus, timeRemaining]);

    // Listen for opponent progress
    useEffect(() => {
        if (!socket) return;

        socket.on('progress_update', (data) => {
            updatePlayerProgress(data.address, data.progress, data.wpm);
        });

        socket.on('game_finished', (data) => {
            console.log('Game finished:', data);
            setWinner(data.winner);
            setGameStatus('finished');
        });

        return () => {
            socket.off('progress_update');
            socket.off('game_finished');
        };
    }, [socket, updatePlayerProgress, setWinner, setGameStatus]);

    // Handle keyboard input
    useEffect(() => {
        if (gameStatus !== 'playing') return;

        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore special keys
            if (e.key.length > 1 && e.key !== ' ') return;

            e.preventDefault();
            handleInput(e.key);
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameStatus, handleInput]);

    // Update own progress
    useEffect(() => {
        if (user) {
            updatePlayerProgress(user.address, progress, wpm);
        }
    }, [progress, wpm, user, updatePlayerProgress]);

    const currentPlayer = players.find((p) => p.address === user?.address);
    const opponent = players.find((p) => p.address !== user?.address);

    // Countdown screen
    if (gameStatus === 'countdown') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={countdown}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="text-center"
                    >
                        {countdown > 0 ? (
                            <div className="text-9xl font-bold text-white">
                                {countdown}
                            </div>
                        ) : (
                            <div className="text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                GO!
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8">
            {/* Header */}
            <div className="max-w-6xl w-full mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-purple-400" />
                        <h2 className="text-2xl font-bold text-white">Typing Race</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <Timer className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-bold text-xl">{timeRemaining}s</span>
                    </div>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="max-w-6xl w-full mx-auto mb-8 space-y-3">
                {/* Current Player */}
                {currentPlayer && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {currentPlayer.username[0].toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-white font-semibold">{currentPlayer.username}</span>
                                <span className="text-blue-400 text-sm">(You)</span>
                            </div>
                            <div className="text-white font-bold">{currentPlayer.wpm} WPM</div>
                        </div>
                        <div className="bg-slate-900 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${currentPlayer.progress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            />
                        </div>
                        <div className="text-right text-blue-400 text-sm mt-1">
                            {currentPlayer.progress.toFixed(0)}%
                        </div>
                    </motion.div>
                )}

                {/* Opponent */}
                {opponent && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {opponent.username[0].toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-white font-semibold">{opponent.username}</span>
                            </div>
                            <div className="text-white font-bold">{opponent.wpm} WPM</div>
                        </div>
                        <div className="bg-slate-900 rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${opponent.progress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-gradient-to-r from-slate-600 to-slate-500"
                            />
                        </div>
                        <div className="text-right text-slate-400 text-sm mt-1">
                            {opponent.progress.toFixed(0)}%
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Typing Area */}
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                    <div className="text-3xl leading-relaxed font-mono">
                        {textToType.split('').map((char, index) => {
                            const status = getCharacterStatus(char, index, typedText, textToType);
                            return (
                                <span
                                    key={index}
                                    className={`
                    ${status === 'correct' ? 'text-green-400' : ''}
                    ${status === 'incorrect' ? 'text-red-400 bg-red-400/20' : ''}
                    ${status === 'current' ? 'text-white bg-blue-500/30 border-b-2 border-blue-400' : ''}
                    ${status === 'pending' ? 'text-slate-500' : ''}
                  `}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 flex items-center justify-center gap-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white">{wpm}</div>
                        <div className="text-slate-400 text-sm">WPM</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white">{progress.toFixed(0)}%</div>
                        <div className="text-slate-400 text-sm">Progress</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
