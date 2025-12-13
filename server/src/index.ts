import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { env } from "./config/env";
import { TournamentEngine } from "./classes/TournamentEngine";
import { blockchainService } from "./services/blockchain.service";
import * as fs from "fs";
import * as path from "path";

const app = express();
const httpServer = createServer(app);

// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(express.json());

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        serverAddress: env.SERVER_ADDRESS,
        contractAddress: env.CONTRACT_ADDRESS || "not deployed",
    });
});

// Get server info
app.get("/api/info", async (req, res) => {
    try {
        const balance = await blockchainService.getServerBalance();
        res.json({
            serverAddress: env.SERVER_ADDRESS,
            contractAddress: env.CONTRACT_ADDRESS || "not deployed",
            serverBalance: balance,
            entryFee: blockchainService.getEntryFee(),
            maxPlayers: env.MAX_PLAYERS_PER_GAME,
            gameDuration: env.GAME_DURATION_SECONDS,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to get server info" });
    }
});

// Load contract address if deployment info exists
const deploymentInfoPath = path.join(__dirname, "../../deployment-info.json");
if (fs.existsSync(deploymentInfoPath)) {
    try {
        const deploymentInfo = JSON.parse(
            fs.readFileSync(deploymentInfoPath, "utf-8")
        );
        if (deploymentInfo.contractAddress) {
            blockchainService.setContractAddress(deploymentInfo.contractAddress);
            console.log("📄 Loaded contract address:", deploymentInfo.contractAddress);
        }
    } catch (error) {
        console.warn("⚠️ Could not load deployment info:", error);
    }
}

// Initialize Tournament Engine
const tournamentEngine = new TournamentEngine(io);

// Start server
const PORT = env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 Typing Tournament Server Started!");
    console.log("=".repeat(60));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔗 Socket.IO ready for connections`);
    console.log(`💼 Server Address: ${env.SERVER_ADDRESS}`);
    console.log(`📝 Contract Address: ${env.CONTRACT_ADDRESS || "Not deployed yet"}`);
    console.log(`💰 Entry Fee: ${env.ENTRY_FEE_MON} MON`);
    console.log(`👥 Max Players: ${env.MAX_PLAYERS_PER_GAME}`);
    console.log(`⏱️  Game Duration: ${env.GAME_DURATION_SECONDS}s`);
    console.log("=".repeat(60) + "\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    httpServer.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("\nSIGINT received, shutting down gracefully...");
    httpServer.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});
