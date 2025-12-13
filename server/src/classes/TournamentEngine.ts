import { Server, Socket } from "socket.io";
import { GameState, Player, SocketEvents, TypingProgress } from "../types";
import { redisService } from "../services/redis.service";
import { blockchainService } from "../services/blockchain.service";
import { authService } from "../services/auth.service";
import { getRandomText } from "../utils/typing";
import { env } from "../config/env";

export class TournamentEngine {
    private io: Server;
    private games: Map<string, GameState> = new Map();
    private socketToPlayer: Map<string, string> = new Map(); // socketId => playerAddress
    private socketToGame: Map<string, string> = new Map(); // socketId => gameId

    constructor(io: Server) {
        this.io = io;
        this.setupSocketHandlers();
        console.log("🎮 Tournament Engine initialized");
    }

    private setupSocketHandlers() {
        this.io.on("connection", (socket: Socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);

            socket.on(SocketEvents.AUTHENTICATE, (data) =>
                this.handleAuthenticate(socket, data)
            );
            socket.on(SocketEvents.CREATE_GAME, () => this.handleCreateGame(socket));
            socket.on(SocketEvents.JOIN_GAME, (data) =>
                this.handleJoinGame(socket, data)
            );
            socket.on(SocketEvents.TYPING_PROGRESS, (data) =>
                this.handleTypingProgress(socket, data)
            );
            socket.on(SocketEvents.LEAVE_GAME, () => this.handleLeaveGame(socket));
            socket.on("disconnect", () => this.handleDisconnect(socket));
        });
    }

    private async handleAuthenticate(socket: Socket, data: { token: string }) {
        try {
            const authPayload = await authService.verifyFarcasterAuth(data.token);

            if (!authPayload) {
                socket.emit(SocketEvents.ERROR, { message: "Authentication failed" });
                return;
            }

            // Store player session
            const player: Player = {
                fid: authPayload.fid,
                username: authPayload.username,
                address: authPayload.address,
                socketId: socket.id,
                progress: 0,
                wpm: 0,
                hasPaid: false,
                joinedAt: Date.now(),
            };

            await redisService.savePlayerSession(socket.id, player);
            this.socketToPlayer.set(socket.id, authPayload.address);

            socket.emit(SocketEvents.AUTHENTICATED, {
                fid: authPayload.fid,
                username: authPayload.username,
                address: authPayload.address,
            });

            console.log(`✅ Authenticated: ${authPayload.username} (${authPayload.address})`);
        } catch (error) {
            console.error("Authentication error:", error);
            socket.emit(SocketEvents.ERROR, { message: "Authentication error" });
        }
    }

    private async handleCreateGame(socket: Socket) {
        try {
            console.log(`🎮 Create game request from socket: ${socket.id}`);

            const player = await redisService.getPlayerSession(socket.id);
            if (!player) {
                console.error(`❌ No player session found for socket: ${socket.id}`);
                socket.emit(SocketEvents.ERROR, { message: "Not authenticated. Please refresh and try again." });
                return;
            }

            console.log(`✅ Player session found: ${player.username} (${player.address})`);

            const gameId = this.generateGameId();
            const textToType = getRandomText();

            const gameState: GameState = {
                gameId,
                status: "waiting",
                players: new Map([[player.address, player]]),
                maxPlayers: env.MAX_PLAYERS_PER_GAME,
                textToType,
                createdAt: Date.now(),
            };

            this.games.set(gameId, gameState);
            this.socketToGame.set(socket.id, gameId);

            await redisService.saveGameState(gameId, gameState);
            await redisService.addActiveGame(gameId);

            socket.join(gameId);

            socket.emit(SocketEvents.GAME_CREATED, {
                gameId,
                textToType,
                maxPlayers: gameState.maxPlayers,
                entryFee: blockchainService.getEntryFee(),
            });

            console.log(`🎮 Game created: ${gameId} by ${player.username}`);
        } catch (error) {
            console.error("Create game error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            socket.emit(SocketEvents.ERROR, { message: "Failed to create game. Please try again." });
        }
    }

    private async handleJoinGame(socket: Socket, data: { gameId: string }) {
        try {
            const player = await redisService.getPlayerSession(socket.id);
            if (!player) {
                socket.emit(SocketEvents.ERROR, { message: "Not authenticated" });
                return;
            }

            const gameState = this.games.get(data.gameId);
            if (!gameState) {
                socket.emit(SocketEvents.ERROR, { message: "Game not found" });
                return;
            }

            if (gameState.status !== "waiting") {
                socket.emit(SocketEvents.ERROR, { message: "Game already started" });
                return;
            }

            if (gameState.players.size >= gameState.maxPlayers) {
                socket.emit(SocketEvents.ERROR, { message: "Game is full" });
                return;
            }

            // Verify payment on blockchain
            const gameIdBigInt = BigInt(data.gameId);
            const hasPaid = await blockchainService.verifyPayment(
                gameIdBigInt,
                player.address as `0x${string}`
            );

            if (!hasPaid) {
                socket.emit(SocketEvents.ERROR, {
                    message: "Payment not verified. Please pay entry fee first.",
                });
                return;
            }

            player.hasPaid = true;
            gameState.players.set(player.address, player);
            this.socketToGame.set(socket.id, data.gameId);

            await redisService.saveGameState(data.gameId, gameState);

            socket.join(data.gameId);

            // Notify player
            socket.emit(SocketEvents.GAME_JOINED, {
                gameId: data.gameId,
                textToType: gameState.textToType,
                players: Array.from(gameState.players.values()).map((p) => ({
                    username: p.username,
                    address: p.address,
                })),
            });

            // Notify other players
            socket.to(data.gameId).emit(SocketEvents.PLAYER_JOINED, {
                username: player.username,
                address: player.address,
            });

            console.log(`👤 ${player.username} joined game ${data.gameId}`);

            // Start game if full
            if (gameState.players.size === gameState.maxPlayers) {
                await this.startGame(data.gameId);
            }
        } catch (error) {
            console.error("Join game error:", error);
            socket.emit(SocketEvents.ERROR, { message: "Failed to join game" });
        }
    }

    private async startGame(gameId: string) {
        const gameState = this.games.get(gameId);
        if (!gameState) return;

        gameState.status = "active";
        gameState.startTime = Date.now();
        gameState.endTime = Date.now() + env.GAME_DURATION_SECONDS * 1000;

        await redisService.saveGameState(gameId, gameState);

        this.io.to(gameId).emit(SocketEvents.GAME_STARTED, {
            startTime: gameState.startTime,
            endTime: gameState.endTime,
            duration: env.GAME_DURATION_SECONDS,
        });

        console.log(`🏁 Game ${gameId} started!`);

        // Set timeout to end game
        setTimeout(() => this.endGame(gameId), env.GAME_DURATION_SECONDS * 1000);
    }

    private async handleTypingProgress(socket: Socket, data: TypingProgress) {
        try {
            const gameId = this.socketToGame.get(socket.id);
            if (!gameId) return;

            const gameState = this.games.get(gameId);
            if (!gameState || gameState.status !== "active") return;

            const player = gameState.players.get(data.address);
            if (!player) return;

            // Update player progress
            player.progress = data.progress;
            player.wpm = data.wpm;

            // Broadcast to other players
            socket.to(gameId).emit(SocketEvents.PROGRESS_UPDATE, {
                address: data.address,
                username: player.username,
                progress: data.progress,
                wpm: data.wpm,
            });

            // Check if player finished
            if (data.progress >= 100) {
                await this.endGame(gameId, data.address);
            }
        } catch (error) {
            console.error("Typing progress error:", error);
        }
    }

    private async endGame(gameId: string, winnerAddress?: string) {
        const gameState = this.games.get(gameId);
        if (!gameState || gameState.status === "finished") return;

        gameState.status = "finished";

        // Determine winner
        let winner: Player | undefined;

        if (winnerAddress) {
            winner = gameState.players.get(winnerAddress);
        } else {
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
            const txHash = await blockchainService.declareWinner(
                gameIdBigInt,
                winner.address as `0x${string}`
            );

            // Notify all players
            this.io.to(gameId).emit(SocketEvents.GAME_FINISHED, {
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
            await redisService.removeActiveGame(gameId);
            this.games.delete(gameId);
        } catch (error) {
            console.error("End game error:", error);
            this.io.to(gameId).emit(SocketEvents.ERROR, {
                message: "Failed to declare winner on blockchain",
            });
        }
    }

    private async handleLeaveGame(socket: Socket) {
        const gameId = this.socketToGame.get(socket.id);
        if (!gameId) return;

        const playerAddress = this.socketToPlayer.get(socket.id);
        if (!playerAddress) return;

        const gameState = this.games.get(gameId);
        if (gameState) {
            const player = gameState.players.get(playerAddress);
            if (player) {
                gameState.players.delete(playerAddress);

                socket.to(gameId).emit(SocketEvents.PLAYER_LEFT, {
                    username: player.username,
                    address: playerAddress,
                });

                // If game is waiting and no players left, delete it
                if (gameState.status === "waiting" && gameState.players.size === 0) {
                    this.games.delete(gameId);
                    await redisService.removeActiveGame(gameId);
                }
            }
        }

        socket.leave(gameId);
        this.socketToGame.delete(socket.id);
    }

    private async handleDisconnect(socket: Socket) {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        await this.handleLeaveGame(socket);
        this.socketToPlayer.delete(socket.id);
        await redisService.deletePlayerSession(socket.id);
    }

    private generateGameId(): string {
        return Date.now().toString();
    }
}
