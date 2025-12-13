import * as dotenv from "dotenv";
import * as path from "path";
import { z } from "zod";
import { fileURLToPath } from "url";

// Load .env.local from parent directory (works with both CommonJS and ESM)
const envPath = path.resolve(process.cwd(), "../.env.local");
dotenv.config({ path: envPath });

const envSchema = z.object({
    // Redis
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    // Neynar
    NEYNAR_API_KEY: z.string().min(1),

    // Monad
    MONAD_RPC_URL: z.string().url(),
    MONAD_CHAIN_ID: z.string().transform(Number),

    // Server
    SERVER_PRIVATE_KEY: z.string().min(64),
    SERVER_ADDRESS: z.string().startsWith("0x"),

    // Contract
    CONTRACT_ADDRESS: z.string().startsWith("0x").optional(),

    // Game Settings
    ENTRY_FEE_MON: z.string().transform(Number),
    MAX_PLAYERS_PER_GAME: z.string().transform(Number),
    GAME_DURATION_SECONDS: z.string().transform(Number),

    // Server Config
    PORT: z.string().transform(Number).default("3001"),
    FRONTEND_URL: z.preprocess(
        (val) => (val === "" || val === undefined ? undefined : val),
        z.string().url().optional()
    ),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
    env = envSchema.parse({
        ...process.env,
        PORT: process.env.PORT || "3001",
    });
} catch (error) {
    console.error("❌ Invalid environment variables:");
    if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
            console.error(`  - ${err.path.join(".")}: ${err.message}`);
        });
    }
    process.exit(1);
}

export { env };
