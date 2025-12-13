import { z } from "zod";
declare const envSchema: z.ZodObject<{
    UPSTASH_REDIS_REST_URL: z.ZodString;
    UPSTASH_REDIS_REST_TOKEN: z.ZodString;
    NEYNAR_API_KEY: z.ZodString;
    MONAD_RPC_URL: z.ZodString;
    MONAD_CHAIN_ID: z.ZodEffects<z.ZodString, number, string>;
    SERVER_PRIVATE_KEY: z.ZodString;
    SERVER_ADDRESS: z.ZodString;
    CONTRACT_ADDRESS: z.ZodOptional<z.ZodString>;
    ENTRY_FEE_MON: z.ZodEffects<z.ZodString, number, string>;
    MAX_PLAYERS_PER_GAME: z.ZodEffects<z.ZodString, number, string>;
    GAME_DURATION_SECONDS: z.ZodEffects<z.ZodString, number, string>;
    PORT: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    FRONTEND_URL: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    NEYNAR_API_KEY: string;
    MONAD_RPC_URL: string;
    MONAD_CHAIN_ID: number;
    SERVER_PRIVATE_KEY: string;
    SERVER_ADDRESS: string;
    ENTRY_FEE_MON: number;
    MAX_PLAYERS_PER_GAME: number;
    GAME_DURATION_SECONDS: number;
    PORT: number;
    CONTRACT_ADDRESS?: string | undefined;
    FRONTEND_URL?: string | undefined;
}, {
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;
    NEYNAR_API_KEY: string;
    MONAD_RPC_URL: string;
    MONAD_CHAIN_ID: string;
    SERVER_PRIVATE_KEY: string;
    SERVER_ADDRESS: string;
    ENTRY_FEE_MON: string;
    MAX_PLAYERS_PER_GAME: string;
    GAME_DURATION_SECONDS: string;
    CONTRACT_ADDRESS?: string | undefined;
    PORT?: string | undefined;
    FRONTEND_URL?: unknown;
}>;
export type Env = z.infer<typeof envSchema>;
declare let env: Env;
export { env };
//# sourceMappingURL=env.d.ts.map