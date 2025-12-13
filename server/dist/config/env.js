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
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const zod_1 = require("zod");
// Load .env.local from parent directory (works with both CommonJS and ESM)
const envPath = path.resolve(process.cwd(), "../.env.local");
dotenv.config({ path: envPath });
const envSchema = zod_1.z.object({
    // Redis
    UPSTASH_REDIS_REST_URL: zod_1.z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: zod_1.z.string().min(1),
    // Neynar
    NEYNAR_API_KEY: zod_1.z.string().min(1),
    // Monad
    MONAD_RPC_URL: zod_1.z.string().url(),
    MONAD_CHAIN_ID: zod_1.z.string().transform(Number),
    // Server
    SERVER_PRIVATE_KEY: zod_1.z.string().min(64),
    SERVER_ADDRESS: zod_1.z.string().startsWith("0x"),
    // Contract
    CONTRACT_ADDRESS: zod_1.z.string().startsWith("0x").optional(),
    // Game Settings
    ENTRY_FEE_MON: zod_1.z.string().transform(Number),
    MAX_PLAYERS_PER_GAME: zod_1.z.string().transform(Number),
    GAME_DURATION_SECONDS: zod_1.z.string().transform(Number),
    // Server Config
    PORT: zod_1.z.string().transform(Number).default("3001"),
    FRONTEND_URL: zod_1.z.preprocess((val) => (val === "" || val === undefined ? undefined : val), zod_1.z.string().url().optional()),
});
let env;
try {
    exports.env = env = envSchema.parse({
        ...process.env,
        PORT: process.env.PORT || "3001",
    });
}
catch (error) {
    console.error("❌ Invalid environment variables:");
    if (error instanceof zod_1.z.ZodError) {
        error.errors.forEach((err) => {
            console.error(`  - ${err.path.join(".")}: ${err.message}`);
        });
    }
    process.exit(1);
}
//# sourceMappingURL=env.js.map