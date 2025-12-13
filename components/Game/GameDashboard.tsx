'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useFrame } from '@/components/farcaster-provider';
import { useAccount } from 'wagmi';
import { useSocket } from '@/hooks/useSocket';
import { useContract } from '@/hooks/useContract';
import { GameLobby } from './GameLobby';
import { TypingGame } from './TypingGame';
import { WinnerModal } from './WinnerModal';
import { Gamepad2, Loader2, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function GameDashboard() {
    const { context } = useFrame();
    const { address } = useAccount();
    const {
        user,
        setUser,
        gameStatus,
        setGameStatus,
        setGameId,
        setTextToType,
        addPlayer,
        setSocket: setGameSocket,
        setConnected,
        setAuthenticated,
        resetGame,
    } = useGame();

    const [isSearching, setIsSearching] = useState(false);
    const [queueSize, setQueueSize] = useState(0);
    const [opponent, setOpponent] = useState<{ username: string; address: string } | null>(null);

    const { payEntryFee, isPending, isConfirming, isSuccess } = useContract();
    const [hasPaid, setHasPaid] = useState(false);

    // Set user from Farcaster context and wagmi account
    useEffect(() => {
        if (context?.user && address) {
            setUser({
                fid: context.user.fid,
                username: context.user.username || context.user.displayName || `User${context.user.fid}`,
                address: address,
            });
        }
    }, [context, address, setUser]);

    // Initialize Socket.IO
    const { socket, connected, authenticated } = useSocket(user);

    useEffect(() => {
        setGameSocket(socket);
        setConnected(connected);
        setAuthenticated(authenticated);
    }, [socket, connected, authenticated, setGameSocket, setConnected, setAuthenticated]);

    // Track payment success
    useEffect(() => {
        if (isSuccess) {
            setHasPaid(true);
        }
    }, [isSuccess]);

    const [currentGameId, setCurrentGameId] = useState<string | null>(null);

    // Listen for matchmaking events
    useEffect(() => {
        if (!socket) return;

        // Backend sends us a gameId to pay for
        socket.on('searching_opponent', (data) => {
            console.log('Got game assignment:', data);
            setIsSearching(true);
            setQueueSize(data.queueSize || 0);

            // Store gameId for payment
            if (data.gameId) {
                setCurrentGameId(data.gameId);
                setTextToType(data.textToType);
            }

            // If opponent already exists, show them
            if (data.opponent) {
                setOpponent(data.opponent);
            }
        });

        socket.on('opponent_found', (data) => {
            console.log('Opponent found!', data);
            setIsSearching(false);
            setGameId(data.gameId);
            setTextToType(data.textToType);
            setOpponent(data.opponent);
            setGameStatus('lobby');

            // Add both players
            if (user) {
                addPlayer({
                    username: user.username,
                    address: user.address,
                    fid: user.fid,
                });
            }
            addPlayer(data.opponent);
        });

        return () => {
            socket.off('searching_opponent');
            socket.off('opponent_found');
        };
    }, [socket, user, setGameId, setTextToType, setGameStatus, addPlayer]);

    const handlePlayNow = () => {
        if (socket && authenticated && !isPending && !isConfirming && !isSearching) {
            console.log('Requesting game from backend...');
            socket.emit('play_now');
        }
    };

    // When we get a gameId from backend, trigger payment
    useEffect(() => {
        if (currentGameId && !hasPaid && !isPending && !isConfirming) {
            console.log('Got gameId from backend, triggering payment:', currentGameId);
            payEntryFee(currentGameId);
        }
    }, [currentGameId, hasPaid, isPending, isConfirming, payEntryFee]);

    // After payment succeeds, THEN tell backend to create/match game
    useEffect(() => {
        if (hasPaid && currentGameId && socket && isSearching) {
            console.log('Payment confirmed! Notifying backend to create/match game:', currentGameId);
            socket.emit('payment_confirmed', { gameId: currentGameId });
        }
    }, [hasPaid, currentGameId, socket, isSearching]);

    // Render different states
    if (gameStatus === 'playing' || gameStatus === 'countdown') {
        return <TypingGame />;
    }

    if (gameStatus === 'finished') {
        return <WinnerModal onPlayAgain={() => {
            resetGame();
            setHasPaid(false);
        }} />;
    }

    if (gameStatus === 'lobby') {
        return <GameLobby />;
    }

    if (isSearching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30 max-w-md w-full text-center"
                >
                    {isPending || isConfirming ? (
                        <>
                            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">
                                {isPending && 'Confirm Payment'}
                                {isConfirming && 'Processing Payment...'}
                            </h2>
                            <p className="text-blue-300 text-lg mb-6">
                                {isPending && 'Please confirm in your wallet'}
                                {isConfirming && 'Transaction confirming...'}
                            </p>
                        </>
                    ) : hasPaid ? (
                        <>
                            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Finding Opponent...</h2>
                            <p className="text-purple-300 text-lg mb-6">
                                {queueSize > 0 ? `${queueSize} player(s) in queue` : 'Waiting for players...'}
                            </p>
                            <p className="text-green-400 text-sm">✅ Payment confirmed</p>
                        </>
                    ) : (
                        <>
                            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Preparing Game...</h2>
                            <p className="text-purple-300 text-lg mb-6">
                                Payment will be requested shortly
                            </p>
                        </>
                    )}
                    <div className="flex items-center justify-center gap-2 text-slate-400 mt-6">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </motion.div>
            </div>
        );
    }

    // Main dashboard (idle state)
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Typing Tournament
                    </h1>
                    <p className="text-xl text-purple-300">
                        Fast fingers win prizes! 🏆
                    </p>
                </motion.div>

                {/* Connection Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-white font-semibold">
                                {connected ? (authenticated ? `Connected as ${user?.username}` : 'Authenticating...') : 'Connecting...'}
                            </span>
                        </div>
                        {address && (
                            <span className="text-slate-400 text-sm font-mono">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Play Now Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30 text-center"
                >
                    <>
                        <Gamepad2 className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        <h2 className="text-4xl font-bold text-white mb-4">Ready to Play?</h2>
                        <p className="text-purple-300 text-lg mb-8">
                            Click to find an opponent! You'll pay 0.01 MON when matched.
                        </p>

                        <button
                            onClick={handlePlayNow}
                            disabled={!authenticated || isSearching}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold text-2xl py-6 px-12 rounded-2xl shadow-2xl transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSearching ? 'Finding Match...' : 'Play Now'}
                        </button>
                    </>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-3 gap-4 mt-8"
                >
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center">
                        <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{queueSize}</p>
                        <p className="text-slate-400 text-sm">In Queue</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center">
                        <Gamepad2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">0.01</p>
                        <p className="text-slate-400 text-sm">MON Entry</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center">
                        <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">0.02</p>
                        <p className="text-slate-400 text-sm">MON Prize</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
