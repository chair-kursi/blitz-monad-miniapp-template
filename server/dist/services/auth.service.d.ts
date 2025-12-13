import { AuthPayload } from "../types";
declare class AuthService {
    private neynarApiKey;
    constructor();
    /**
     * Verify Farcaster user authentication
     * In production, this would verify the Farcaster signature
     * For MVP, we'll do basic validation
     */
    verifyFarcasterAuth(token: string): Promise<AuthPayload | null>;
    /**
     * Verify with Neynar API (production-ready)
     * Uncomment when ready to use real Farcaster auth
     */
    verifyWithNeynar(token: string): Promise<AuthPayload | null>;
    /**
     * Create auth token for testing
     */
    createTestToken(fid: number, username: string, address: string): string;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map