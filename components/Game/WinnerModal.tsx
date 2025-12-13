'use client';

import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { Trophy, Zap, RotateCcw, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerModalProps {
    onPlayAgain: () => void;
}

export function WinnerModal({ onPlayAgain }: WinnerModalProps) {
    const { winner, players, user } = useGame();

    const isWinner = winner?.address === user?.address;
    const prizeAmount = (players.length * 0.01).toFixed(2);

    // Trigger confetti for winner
    useEffect(() => {
        if (isWinner) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#8B5CF6', '#3B82F6', '#10B981'],
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#8B5CF6', '#3B82F6', '#10B981'],
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [isWinner]);

    if (!winner) return null;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
            >
                {/* Trophy Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                            }}
                            className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                        >
                            <Trophy className="w-16 h-16 text-white" />
                        </motion.div>
                        {isWinner && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-900"
                            >
                                <Zap className="w-6 h-6 text-white" />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Winner Announcement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-5xl font-bold text-white mb-4">
                        {isWinner ? '🎉 You Won!' : 'Game Over'}
                    </h2>
                    <p className="text-2xl text-slate-300">
                        {isWinner ? 'Congratulations!' : `${winner.username} wins!`}
                    </p>
                </motion.div>

                {/* Winner Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`rounded-2xl p-8 mb-6 border-2 ${isWinner
                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                            : 'bg-slate-800/50 border-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">
                                {winner.username[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-2xl">{winner.username}</h3>
                            <p className="text-slate-400">
                                {winner.address.slice(0, 6)}...{winner.address.slice(-4)}
                            </p>
                        </div>
                        {isWinner && (
                            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full font-bold border border-yellow-500/30">
                                Winner
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">
                                {winner.progress.toFixed(0)}%
                            </div>
                            <div className="text-slate-400 text-sm">Progress</div>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">{winner.wpm}</div>
                            <div className="text-slate-400 text-sm">WPM</div>
                        </div>
                    </div>
                </motion.div>

                {/* Prize */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6 mb-6"
                >
                    <div className="text-center">
                        <p className="text-slate-300 mb-2">Prize Amount</p>
                        <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            {prizeAmount} MON
                        </div>
                        {isWinner && (
                            <p className="text-green-400 text-sm mt-2">✓ Transferred to your wallet</p>
                        )}
                    </div>
                </motion.div>

                {/* All Players */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6"
                >
                    <h4 className="text-white font-bold mb-4">Final Results</h4>
                    <div className="space-y-3">
                        {players
                            .sort((a, b) => b.progress - a.progress)
                            .map((player, index) => (
                                <div
                                    key={player.address}
                                    className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3"
                                >
                                    <div className="text-slate-400 font-bold w-6">#{index + 1}</div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">
                                            {player.username[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-semibold">{player.username}</p>
                                        <p className="text-slate-400 text-sm">
                                            {player.progress.toFixed(0)}% • {player.wpm} WPM
                                        </p>
                                    </div>
                                    {player.address === winner.address && (
                                        <Trophy className="w-5 h-5 text-yellow-400" />
                                    )}
                                </div>
                            ))}
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-4"
                >
                    <button
                        onClick={onPlayAgain}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Play Again
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
