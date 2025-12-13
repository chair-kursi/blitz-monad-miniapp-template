"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentEngine = void 0;
const types_1 = require("../types");
const redis_service_1 = require("../services/redis.service");
const blockchain_service_1 = require("../services/blockchain.service");
const auth_service_1 = require("../services/auth.service");
const matchmaking_service_1 = require("../services/matchmaking.service");
const typing_1 = require("../utils/typing");
const env_1 = require("../config/env");
class TournamentEngine {
    io;
    games = new Map();
    socketToPlayer = new Map(); // socketId => playerAddress
    socketToGame = new Map(); // socketId => gameId
    constructor(io) {
        this.io = io;
        this.setupSocketHandlers();
        console.log("🎮 Tournament Engine initialized");
    }
    setupSocketHandlers() {
        this.io.on("connection", (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            socket.on(types_1.SocketEvents.AUTHENTICATE, (data) => this.handleAuthenticate(socket, data));
            socket.on(types_1.SocketEvents.PLAY_NOW, () => this.handlePlayNow(socket));
            socket.on(types_1.SocketEvents.CREATE_GAME, () => this.handleCreateGame(socket));
            socket.on(types_1.SocketEvents.JOIN_GAME, (data) => this.handleJoinGame(socket, data));
            socket.on(types_1.SocketEvents.TYPING_PROGRESS, (data) => this.handleTypingProgress(socket, data));
            socket.on(types_1.SocketEvents.LEAVE_GAME, () => this.handleLeaveGame(socket));
            socket.on("disconnect", () => this.handleDisconnect(socket));
        });
    }
    async handleAuthenticate(socket, data) {
        try {
            const authPayload = await auth_service_1.authService.verifyFarcasterAuth(data.token);
            if (!authPayload) {
                socket.emit(types_1.SocketEvents.ERROR, { message: "Authentication failed" });
                return;
            }
            // Store player session
            const player = {
                fid: authPayload.fid,
                username: authPayload.username,
                address: authPayload.address,
                socketId: socket.id,
                progress: 0,
                wpm: 0,
                hasPaid: false,
                joinedAt: Date.now(),
            };
            await redis_service_1.redisService.savePlayerSession(socket.id, player);
            this.socketToPlayer.set(socket.id, authPayload.address);
            socket.emit(types_1.SocketEvents.AUTHENTICATED, {
                fid: authPayload.fid,
                username: authPayload.username,
                address: authPayload.address,
            });
            console.log(`✅ Authenticated: ${authPayload.username} (${authPayload.address})`);
        }
        catch (error) {
            console.error("Authentication error:", error);
            socket.emit(types_1.SocketEvents.ERROR, { message: "Authentication error" });
        }
    }
    async handlePlayNow(socket) {
        try {
            const player = await redis_service_1.redisService.getPlayerSession(socket.id);
            if (!player) {
                socket.emit(types_1.SocketEvents.ERROR, { message: "Not authenticated" });
                return;
            }
            console.log(`🎮 ${player.username} wants to play`);
            // Emit searching status
            socket.emit(types_1.SocketEvents.SEARCHING_OPPONENT, {
                queueSize: await matchmaking_service_1.matchmakingService.getQueueSize()
            });
            // Try to find a match
            const opponent = await matchmaking_service_1.matchmakingService.addToQueue(player, socket.id);
            if (opponent) {
                // Match found! Create game with both players
                console.log(`✅ Match found: ${player.username} vs ${opponent.username}`);
                const gameId = Date.now().toString();
                const textToType = (0, typing_1.getRandomText)();
                const gameState = {
                    gameId,
                    status: "waiting",
                    players: new Map(),
                    maxPlayers: 2,
                    textToType,
                    createdAt: Date.now(),
                };
                // Add both players
                gameState.players.set(player.address, player);
                gameState.players.set(opponent.address, {
                    ...opponent,
                    progress: 0,
                    wpm: 0,
                    hasPaid: false,
                    joinedAt: Date.now(),
                });
                this.games.set(gameId, gameState);
                this.socketToGame.set(socket.id, gameId);
                this.socketToGame.set(opponent.socketId, gameId);
                await redis_service_1.redisService.saveGameState(gameId, gameState);
                // Notify both players
                socket.emit(types_1.SocketEvents.OPPONENT_FOUND, {
                    gameId,
                    textToType,
                    opponent: {
                        username: opponent.username,
                        address: opponent.address,
                    }
                });
                this.io.to(opponent.socketId).emit(types_1.SocketEvents.OPPONENT_FOUND, {
                    gameId,
                    textToType,
                    opponent: {
                        username: player.username,
                        address: player.address,
                    }
                });
                console.log(`🎮 Game ${gameId} created with ${player.username} and ${opponent.username}`);
            }
            else {
                // No match yet, player added to queue
                console.log(`⏳ ${player.username} added to queue, waiting for opponent`);
            }
        }
        catch (error) {
            console.error("Play now error:", error);
            socket.emit(types_1.SocketEvents.ERROR, { message: "Failed to find match" });
        }
    }
    async handleCreateGame(socket) {
        try {
            console.log(`🎮 Create game request from socket: ${socket.id}`);
            const player = await redis_service_1.redisService.getPlayerSession(socket.id);
            if (!player) {
                console.error(`❌ No player session found for socket: ${socket.id}`);
                socket.emit(types_1.SocketEvents.ERROR, { message: "Not authenticated. Please refresh and try again." });
                return;
            }
            console.log(`✅ Player session found: ${player.username} (${player.address})`);
            const gameId = this.generateGameId();
            const textToType = (0, typing_1.getRandomText)();
            const gameState = {
                gameId,
                status: "waiting",
                players: new Map([[player.address, player]]),
                maxPlayers: env_1.env.MAX_PLAYERS_PER_GAME,
                textToType,
                createdAt: Date.now(),
            };
            this.games.set(gameId, gameState);
            this.socketToGame.set(socket.id, gameId);
            await redis_service_1.redisService.saveGameState(gameId, gameState);
            await redis_service_1.redisService.addActiveGame(gameId);
            socket.join(gameId);
            socket.emit(types_1.SocketEvents.GAME_CREATED, {
                gameId,
                textToType,
                maxPlayers: gameState.maxPlayers,
                entryFee: blockchain_service_1.blockchainService.getEntryFee(),
            });
            console.log(`🎮 Game created: ${gameId} by ${player.username}`);
        }
        catch (error) {
            console.error("Create game error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            socket.emit(types_1.SocketEvents.ERROR, { message: "Failed to create game. Please try again." });
        }
    }
    async handleJoinGame(socket, data) {
        try {
            const player = await redis_service_1.redisService.getPlayerSession(socket.id);
            if (!player) {
                socket.emit(types_1.SocketEvents.ERROR, { message: "Not authenticated" });
                return;
            }
            const gameState = this.games.get(data.gameId);
            if (!gameState) {
                socket.emit(types_1.SocketEvents.ERROR, { message: "Game not found" });
                return;
            }
            if (gameState.status !== "waiting") {
                socket.emit(types_1.SocketEvents.ERROR, { message: "Game already started" });
                return;
            }
            if (gameState.players.size >= gameState.maxPlayers) {
                socket.emit(types_1.SocketEvents.ERROR, { message: "Game is full" });
                return;
            }
            // Verify payment on blockchain
            const gameIdBigInt = BigInt(data.gameId);
            const hasPaid = await blockchain_service_1.blockchainService.verifyPayment(gameIdBigInt, player.address);
            if (!hasPaid) {
                socket.emit(types_1.SocketEvents.ERROR, {
                    message: "Payment not verified. Please pay entry fee first.",
                });
                return;
            }
            player.hasPaid = true;
            gameState.players.set(player.address, player);
            this.socketToGame.set(socket.id, data.gameId);
            await redis_service_1.redisService.saveGameState(data.gameId, gameState);
            socket.join(data.gameId);
            // Notify player
            socket.emit(types_1.SocketEvents.GAME_JOINED, {
                gameId: data.gameId,
                textToType: gameState.textToType,
                players: Array.from(gameState.players.values()).map((p) => ({
                    username: p.username,
                    address: p.address,
                })),
            });
            // Notify other players
            socket.to(data.gameId).emit(types_1.SocketEvents.PLAYER_JOINED, {
                username: player.username,
                address: player.address,
            });
            console.log(`👤 ${player.username} joined game ${data.gameId}`);
            // Start game if full
            if (gameState.players.size === gameState.maxPlayers) {
                await this.startGame(data.gameId);
            }
        }
        catch (error) {
            console.error("Join game error:", error);
            socket.emit(types_1.SocketEvents.ERROR, { message: "Failed to join game" });
        }
    }
    async startGame(gameId) {
        const gameState = this.games.get(gameId);
        if (!gameState)
            return;
        gameState.status = "active";
        gameState.startTime = Date.now();
        gameState.endTime = Date.now() + env_1.env.GAME_DURATION_SECONDS * 1000;
        await redis_service_1.redisService.saveGameState(gameId, gameState);
        this.io.to(gameId).emit(types_1.SocketEvents.GAME_STARTED, {
            startTime: gameState.startTime,
            endTime: gameState.endTime,
            duration: env_1.env.GAME_DURATION_SECONDS,
        });
        console.log(`🏁 Game ${gameId} started!`);
        // Set timeout to end game
        setTimeout(() => this.endGame(gameId), env_1.env.GAME_DURATION_SECONDS * 1000);
    }
    async handleTypingProgress(socket, data) {
        try {
            const gameId = this.socketToGame.get(socket.id);
            if (!gameId)
                return;
            const gameState = this.games.get(gameId);
            if (!gameState || gameState.status !== "active")
                return;
            const player = gameState.players.get(data.address);
            if (!player)
                return;
            // Update player progress
            player.progress = data.progress;
            player.wpm = data.wpm;
            // Broadcast to other players
            socket.to(gameId).emit(types_1.SocketEvents.PROGRESS_UPDATE, {
                address: data.address,
                username: player.username,
                progress: data.progress,
                wpm: data.wpm,
            });
            // Check if player finished
            if (data.progress >= 100) {
                await this.endGame(gameId, data.address);
            }
        }
        catch (error) {
            console.error("Typing progress error:", error);
        }
    }
    async endGame(gameId, winnerAddress) {
        const gameState = this.games.get(gameId);
        if (!gameState || gameState.status === "finished")
            return;
        gameState.status = "finished";
        // Determine winner
        let winner;
        if (winnerAddress) {
            winner = gameState.players.get(winnerAddress);
        }
        else {
            // Find player with highest progress
            let maxProgress = 0;
            for (const player of gameState.players.values()) {
                if (player.progress > maxProgress) {
                    maxProgress = player.progress;
                    winner = player;
                }
            }
        }
        if (!winner) {
            console.error("No winner found for game", gameId);
            return;
        }
        gameState.winner = winner.address;
        try {
            // Declare winner on blockchain
            const gameIdBigInt = BigInt(gameId);
            const txHash = await blockchain_service_1.blockchainService.declareWinner(gameIdBigInt, winner.address);
            // Notify all players
            this.io.to(gameId).emit(types_1.SocketEvents.GAME_FINISHED, {
                winner: {
                    username: winner.username,
                    address: winner.address,
                    progress: winner.progress,
                    wpm: winner.wpm,
                },
                txHash,
            });
            console.log(`🏆 Game ${gameId} finished! Winner: ${winner.username}`);
            // Cleanup
            await redis_service_1.redisService.removeActiveGame(gameId);
            this.games.delete(gameId);
        }
        catch (error) {
            console.error("End game error:", error);
            this.io.to(gameId).emit(types_1.SocketEvents.ERROR, {
                message: "Failed to declare winner on blockchain",
            });
        }
    }
    async handleLeaveGame(socket) {
        const gameId = this.socketToGame.get(socket.id);
        if (!gameId)
            return;
        const playerAddress = this.socketToPlayer.get(socket.id);
        if (!playerAddress)
            return;
        const gameState = this.games.get(gameId);
        if (gameState) {
            const player = gameState.players.get(playerAddress);
            if (player) {
                gameState.players.delete(playerAddress);
                socket.to(gameId).emit(types_1.SocketEvents.PLAYER_LEFT, {
                    username: player.username,
                    address: playerAddress,
                });
                // If game is waiting and no players left, delete it
                if (gameState.status === "waiting" && gameState.players.size === 0) {
                    this.games.delete(gameId);
                    await redis_service_1.redisService.removeActiveGame(gameId);
                }
            }
        }
        socket.leave(gameId);
        this.socketToGame.delete(socket.id);
    }
    async handleDisconnect(socket) {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        await this.handleLeaveGame(socket);
        this.socketToPlayer.delete(socket.id);
        await redis_service_1.redisService.deletePlayerSession(socket.id);
    }
    generateGameId() {
        return Date.now().toString();
    }
}
exports.TournamentEngine = TournamentEngine;
//# sourceMappingURL=TournamentEngine.js.map