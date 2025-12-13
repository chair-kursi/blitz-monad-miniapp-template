import { env } from "../config/env";
import { AuthPayload } from "../types";

class AuthService {
    private neynarApiKey: string;

    constructor() {
        this.neynarApiKey = env.NEYNAR_API_KEY;
    }

    /**
     * Verify Farcaster user authentication
     * In production, this would verify the Farcaster signature
     * For MVP, we'll do basic validation
     */
    async verifyFarcasterAuth(token: string): Promise<AuthPayload | null> {
        try {
            // For MVP: Parse the token as JSON
            // In production: Verify signature with Neynar API
            const payload = JSON.parse(Buffer.from(token, "base64").toString());

            if (!payload.fid || !payload.username || !payload.address) {
                return null;
            }

            // Validate address format
            if (!payload.address.startsWith("0x") || payload.address.length !== 42) {
                return null;
            }

            return {
                fid: payload.fid,
                username: payload.username,
                address: payload.address.toLowerCase(),
            };
        } catch (error) {
            console.error("Auth verification error:", error);
            return null;
        }
    }

    /**
     * Verify with Neynar API (production-ready)
     * Uncomment when ready to use real Farcaster auth
     */
    async verifyWithNeynar(token: string): Promise<AuthPayload | null> {
        try {
            const response = await fetch("https://api.neynar.com/v2/farcaster/user/bulk", {
                headers: {
                    "api_key": this.neynarApiKey,
                },
            });

            if (!response.ok) {
                throw new Error("Neynar API error");
            }

            const data = await response.json();
            // Parse Neynar response and extract user data
            // This is a placeholder - implement based on Neynar docs

            return null;
        } catch (error) {
            console.error("Neynar verification error:", error);
            return null;
        }
    }

    /**
     * Create auth token for testing
     */
    createTestToken(fid: number, username: string, address: string): string {
        const payload = { fid, username, address };
        return Buffer.from(JSON.stringify(payload)).toString("base64");
    }
}

export const authService = new AuthService();
