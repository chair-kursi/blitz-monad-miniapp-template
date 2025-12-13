'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useContract } from '@/hooks/useContract';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Loader2, Crown } from 'lucide-react';
import { copyToClipboard } from '@/lib/game/utils';

export function GameLobby() {
    const {
        gameId,
        players,
        user,
        socket,
        setGameStatus,
        setStartTime,
        setEndTime,
        addPlayer,
        removePlayer,
    } = useGame();

    const { payEntryFee, isPending, isConfirming, isSuccess, isError } = useContract();
    const [copied, setCopied] = useState(false);
    const [hasPaid, setHasPaid] = useState(false);
    const [paymentAttempted, setPaymentAttempted] = useState(false);

    // Handle payment - only trigger once automatically
    useEffect(() => {
        if (gameId && !hasPaid && !isPending && !isConfirming && !paymentAttempted) {
            setPaymentAttempted(true);
            payEntryFee(gameId);
        }
    }, [gameId, hasPaid, isPending, isConfirming, paymentAttempted, payEntryFee]);

    useEffect(() => {
        if (isSuccess) {
            setHasPaid(true);
        }
    }, [isSuccess]);

    // Manual retry function
    const handleRetryPayment = () => {
        if (gameId) {
            payEntryFee(gameId);
        }
    };

    // Listen for player events
    useEffect(() => {
        if (!socket) return;

        socket.on('player_joined', (data) => {
            console.log('Player joined:', data);
            addPlayer(data);
        });

        socket.on('player_left', (data) => {
            console.log('Player left:', data);
            removePlayer(data.address);
        });

        socket.on('game_started', (data) => {
            console.log('Game started:', data);
            setStartTime(data.startTime);
            setEndTime(data.endTime);
            setGameStatus('countdown');
        });

        return () => {
            socket.off('player_joined');
            socket.off('player_left');
            socket.off('game_started');
        };
    }, [socket, addPlayer, removePlayer, setGameStatus, setStartTime, setEndTime]);

    const handleCopyGameId = async () => {
        if (gameId) {
            const success = await copyToClipboard(gameId);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    };

    const playerCount = players.length;
    const maxPlayers = 2;
    const isWaitingForOpponent = playerCount < maxPlayers;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="inline-block mb-4"
                    >
                        <Users className="w-16 h-16 text-purple-400" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-white mb-2">Game Lobby</h2>
                    <p className="text-slate-300">
                        {isWaitingForOpponent ? 'Waiting for opponent...' : 'Game starting soon!'}
                    </p>
                </div>

                {/* Game ID */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700"
                >
                    <label className="block text-slate-400 text-sm font-semibold mb-2">
                        Game ID (Share with opponent)
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-900 px-4 py-3 rounded-xl border border-slate-700 font-mono text-white">
                            {gameId}
                        </div>
                        <button
                            onClick={handleCopyGameId}
                            className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-all"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.div>

                {/* Payment Status */}
                {!hasPaid && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                            <div>
                                <p className="text-blue-400 font-semibold">
                                    {isPending && 'Confirm payment in wallet...'}
                                    {isConfirming && 'Processing payment...'}
                                    {!isPending && !isConfirming && 'Preparing payment...'}
                                </p>
                                <p className="text-blue-300 text-sm">Entry fee: 0.01 MON</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {hasPaid && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <Check className="w-6 h-6 text-green-400" />
                            <div>
                                <p className="text-green-400 font-semibold">Payment confirmed!</p>
                                <p className="text-green-300 text-sm">You're in the game</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isError && !hasPaid && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 text-red-400">⚠️</div>
                                <div>
                                    <p className="text-red-400 font-semibold">Payment failed or cancelled</p>
                                    <p className="text-red-300 text-sm">Click retry to try again</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRetryPayment}
                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                            >
                                Retry Payment
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Players */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-lg">Players</h3>
                        <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30">
                            {playerCount}/{maxPlayers}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {players.map((player, index) => (
                            <motion.div
                                key={player.address}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="bg-slate-900 rounded-xl p-4 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {player.username[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold">{player.username}</p>
                                    <p className="text-slate-400 text-sm">
                                        {player.address.slice(0, 6)}...{player.address.slice(-4)}
                                    </p>
                                </div>
                                {player.address === user?.address && (
                                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                                        You
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* Empty slot */}
                        {isWaitingForOpponent && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-xl p-4 flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 text-slate-600 animate-spin mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">Waiting for opponent...</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Prize Pool */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-6 py-3">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">
                            Prize Pool: {(playerCount * 0.01).toFixed(2)} MON
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
