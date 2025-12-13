"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const env_1 = require("../config/env");
class AuthService {
    neynarApiKey;
    constructor() {
        this.neynarApiKey = env_1.env.NEYNAR_API_KEY;
    }
    /**
     * Verify Farcaster user authentication
     * In production, this would verify the Farcaster signature
     * For MVP, we'll do basic validation
     */
    async verifyFarcasterAuth(token) {
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
        }
        catch (error) {
            console.error("Auth verification error:", error);
            return null;
        }
    }
    /**
     * Verify with Neynar API (production-ready)
     * Uncomment when ready to use real Farcaster auth
     */
    async verifyWithNeynar(token) {
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
        }
        catch (error) {
            console.error("Neynar verification error:", error);
            return null;
        }
    }
    /**
     * Create auth token for testing
     */
    createTestToken(fid, username, address) {
        const payload = { fid, username, address };
        return Buffer.from(JSON.stringify(payload)).toString("base64");
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map