import {
    createPublicClient,
    createWalletClient,
    http,
    parseEther,
    formatEther,
    Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "../config/env";
import contractABI from "../../../lib/contract-abi.json";

// Define Monad Testnet chain
const monadTestnet = {
    id: env.MONAD_CHAIN_ID,
    name: "Monad Testnet",
    network: "monad-testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Monad",
        symbol: "MON",
    },
    rpcUrls: {
        default: { http: [env.MONAD_RPC_URL] },
        public: { http: [env.MONAD_RPC_URL] },
    },
} as const;

class BlockchainService {
    private publicClient;
    private walletClient;
    private account;
    private contractAddress: Address;

    constructor() {
        // Ensure private key has 0x prefix
        const privateKey = env.SERVER_PRIVATE_KEY.startsWith("0x")
            ? env.SERVER_PRIVATE_KEY
            : `0x${env.SERVER_PRIVATE_KEY}`;

        this.account = privateKeyToAccount(privateKey as `0x${string}`);

        this.publicClient = createPublicClient({
            chain: monadTestnet,
            transport: http(),
        });

        this.walletClient = createWalletClient({
            account: this.account,
            chain: monadTestnet,
            transport: http(),
        });

        // Will be set after contract deployment
        this.contractAddress = (env.CONTRACT_ADDRESS || "0x") as Address;
    }

    setContractAddress(address: string) {
        this.contractAddress = address as Address;
    }

    async getServerBalance(): Promise<string> {
        const balance = await this.publicClient.getBalance({
            address: this.account.address,
        });
        return formatEther(balance);
    }

    async verifyPayment(gameId: bigint, playerAddress: Address): Promise<boolean> {
        if (!this.contractAddress || this.contractAddress === "0x") {
            console.warn("⚠️ Contract address not set, skipping payment verification");
            return true; // For testing without deployed contract
        }

        try {
            const hasPaid = await this.publicClient.readContract({
                address: this.contractAddress,
                abi: contractABI,
                functionName: "hasPlayerPaid",
                args: [gameId, playerAddress],
            });

            return hasPaid as boolean;
        } catch (error) {
            console.error("Error verifying payment:", error);
            return false;
        }
    }

    async getGamePool(gameId: bigint): Promise<string> {
        if (!this.contractAddress || this.contractAddress === "0x") {
            return "0";
        }

        try {
            const pool = await this.publicClient.readContract({
                address: this.contractAddress,
                abi: contractABI,
                functionName: "getGamePool",
                args: [gameId],
            });

            return formatEther(pool as bigint);
        } catch (error) {
            console.error("Error getting game pool:", error);
            return "0";
        }
    }

    async declareWinner(gameId: bigint, winnerAddress: Address): Promise<string> {
        if (!this.contractAddress || this.contractAddress === "0x") {
            throw new Error("Contract address not set");
        }

        try {
            console.log(`🏆 Declaring winner for game ${gameId}: ${winnerAddress}`);

            const { request } = await this.publicClient.simulateContract({
                account: this.account,
                address: this.contractAddress,
                abi: contractABI,
                functionName: "declareWinner",
                args: [gameId, winnerAddress],
            });

            const hash = await this.walletClient.writeContract(request);

            console.log("📝 Transaction hash:", hash);

            // Wait for transaction confirmation
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash,
            });

            console.log("✅ Winner declared! Transaction confirmed:", receipt.transactionHash);

            return receipt.transactionHash;
        } catch (error) {
            console.error("❌ Error declaring winner:", error);
            throw error;
        }
    }

    async getPlayerCount(gameId: bigint): Promise<number> {
        if (!this.contractAddress || this.contractAddress === "0x") {
            return 0;
        }

        try {
            const count = await this.publicClient.readContract({
                address: this.contractAddress,
                abi: contractABI,
                functionName: "getPlayerCount",
                args: [gameId],
            });

            return Number(count);
        } catch (error) {
            console.error("Error getting player count:", error);
            return 0;
        }
    }

    getEntryFee(): string {
        return env.ENTRY_FEE_MON.toString();
    }
}

export const blockchainService = new BlockchainService();
