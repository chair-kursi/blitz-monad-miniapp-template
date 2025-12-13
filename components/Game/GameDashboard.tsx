'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useFrame } from '@/components/farcaster-provider';
import { useAccount } from 'wagmi';
import { useSocket } from '@/hooks/useSocket';
import { GameLobby } from './GameLobby';
import { TypingGame } from './TypingGame';
import { WinnerModal } from './WinnerModal';
import { Gamepad2, Users, Zap } from 'lucide-react';
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

    const [showJoinInput, setShowJoinInput] = useState(false);
    const [joinGameId, setJoinGameId] = useState('');

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

    // Listen for game events
    useEffect(() => {
        if (!socket) return;

        socket.on('game_created', (data) => {
            console.log('Game created:', data);
            setGameId(data.gameId);
            setTextToType(data.textToType);
            setGameStatus('lobby');

            // Add current user to players
            if (user) {
                addPlayer({
                    username: user.username,
                    address: user.address,
                    fid: user.fid,
                });
            }
        });

        socket.on('game_joined', (data) => {
            console.log('Game joined:', data);
            setGameId(data.gameId);
            setTextToType(data.textToType);
            setGameStatus('lobby');

            // Add all players
            data.players.forEach((player: { username: string; address: string; fid?: number }) => addPlayer(player));
        });

        return () => {
            socket.off('game_created');
            socket.off('game_joined');
        };
    }, [socket, user, setGameId, setTextToType, setGameStatus, addPlayer]);

    const handleCreateGame = () => {
        if (socket && authenticated) {
            socket.emit('create_game');
        }
    };

    const handleJoinGame = () => {
        if (socket && authenticated && joinGameId) {
            socket.emit('join_game', { gameId: joinGameId });
            setShowJoinInput(false);
            setJoinGameId('');
        }
    };

    const handlePlayAgain = () => {
        resetGame();
        setGameStatus('idle');
    };

    // Render based on game status
    if (gameStatus === 'lobby') {
        return <GameLobby />;
    }

    if (gameStatus === 'countdown' || gameStatus === 'playing') {
        return <TypingGame />;
    }

    if (gameStatus === 'finished') {
        return <WinnerModal onPlayAgain={handlePlayAgain} />;
    }

    // Dashboard (idle state)
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="inline-block mb-6"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                            <Zap className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>

                    <h1 className="text-5xl font-bold text-white mb-4">
                        Typing Tournament
                    </h1>
                    <p className="text-xl text-slate-300">
                        1v1 typing race • Winner takes all • 0.01 MON entry
                    </p>
                </div>

                {/* User Info */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {user.username[0].toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">{user.username}</p>
                                <p className="text-slate-400 text-sm">
                                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                </p>
                            </div>
                            <div className="ml-auto">
                                <div className={`px-3 py-1 rounded-full text-sm ${authenticated
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    }`}>
                                    {authenticated ? 'Connected' : 'Connecting...'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateGame}
                        disabled={!authenticated}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                    >
                        <Gamepad2 className="w-6 h-6" />
                        <span className="text-lg">Create New Game</span>
                    </motion.button>

                    {!showJoinInput ? (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowJoinInput(true)}
                            disabled={!authenticated}
                            className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3 border border-slate-700 disabled:cursor-not-allowed"
                        >
                            <Users className="w-6 h-6" />
                            <span className="text-lg">Join Game</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
                        >
                            <label className="block text-white font-semibold mb-3">
                                Enter Game ID
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={joinGameId}
                                    onChange={(e) => setJoinGameId(e.target.value)}
                                    placeholder="Game ID"
                                    className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-purple-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleJoinGame}
                                    disabled={!joinGameId}
                                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:cursor-not-allowed"
                                >
                                    Join
                                </button>
                                <button
                                    onClick={() => {
                                        setShowJoinInput(false);
                                        setJoinGameId('');
                                    }}
                                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center text-slate-400 text-sm"
                >
                    <p>Entry fee: 0.01 MON • Winner takes: 0.02 MON • Duration: 60 seconds</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
