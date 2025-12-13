"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const TournamentEngine_1 = require("./classes/TournamentEngine");
const blockchain_service_1 = require("./services/blockchain.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    env_1.env.FRONTEND_URL,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
// Socket.IO setup
const io = new socket_io_1.Server(httpServer, {
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
        serverAddress: env_1.env.SERVER_ADDRESS,
        contractAddress: env_1.env.CONTRACT_ADDRESS || "not deployed",
    });
});
// Get server info
app.get("/api/info", async (req, res) => {
    try {
        const balance = await blockchain_service_1.blockchainService.getServerBalance();
        res.json({
            serverAddress: env_1.env.SERVER_ADDRESS,
            contractAddress: env_1.env.CONTRACT_ADDRESS || "not deployed",
            serverBalance: balance,
            entryFee: blockchain_service_1.blockchainService.getEntryFee(),
            maxPlayers: env_1.env.MAX_PLAYERS_PER_GAME,
            gameDuration: env_1.env.GAME_DURATION_SECONDS,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get server info" });
    }
});
// Load contract address if deployment info exists
const deploymentInfoPath = path.join(__dirname, "../../deployment-info.json");
if (fs.existsSync(deploymentInfoPath)) {
    try {
        const deploymentInfo = JSON.parse(fs.readFileSync(deploymentInfoPath, "utf-8"));
        if (deploymentInfo.contractAddress) {
            blockchain_service_1.blockchainService.setContractAddress(deploymentInfo.contractAddress);
            console.log("📄 Loaded contract address:", deploymentInfo.contractAddress);
        }
    }
    catch (error) {
        console.warn("⚠️ Could not load deployment info:", error);
    }
}
// Initialize Tournament Engine
const tournamentEngine = new TournamentEngine_1.TournamentEngine(io);
// Start server
const PORT = env_1.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 Typing Tournament Server Started!");
    console.log("=".repeat(60));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔗 Socket.IO ready for connections`);
    console.log(`💼 Server Address: ${env_1.env.SERVER_ADDRESS}`);
    console.log(`📝 Contract Address: ${env_1.env.CONTRACT_ADDRESS || "Not deployed yet"}`);
    console.log(`💰 Entry Fee: ${env_1.env.ENTRY_FEE_MON} MON`);
    console.log(`👥 Max Players: ${env_1.env.MAX_PLAYERS_PER_GAME}`);
    console.log(`⏱️  Game Duration: ${env_1.env.GAME_DURATION_SECONDS}s`);
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
//# sourceMappingURL=index.js.map