"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = void 0;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const env_1 = require("../config/env");
const contract_abi_json_1 = __importDefault(require("../../../lib/contract-abi.json"));
// Define Monad Testnet chain
const monadTestnet = {
    id: env_1.env.MONAD_CHAIN_ID,
    name: "Monad Testnet",
    network: "monad-testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Monad",
        symbol: "MON",
    },
    rpcUrls: {
        default: { http: [env_1.env.MONAD_RPC_URL] },
        public: { http: [env_1.env.MONAD_RPC_URL] },
    },
};
class BlockchainService {
    publicClient;
    walletClient;
    account;
    contractAddress;
    constructor() {
        // Ensure private key has 0x prefix
        const privateKey = env_1.env.SERVER_PRIVATE_KEY.startsWith("0x")
            ? env_1.env.SERVER_PRIVATE_KEY
            : `0x${env_1.env.SERVER_PRIVATE_KEY}`;
        this.account = (0, accounts_1.privateKeyToAccount)(privateKey);
        this.publicClient = (0, viem_1.createPublicClient)({
            chain: monadTestnet,
            transport: (0, viem_1.http)(),
        });
        this.walletClient = (0, viem_1.createWalletClient)({
            account: this.account,
            chain: monadTestnet,
            transport: (0, viem_1.http)(),
        });
        // Will be set after contract deployment
        this.contractAddress = (env_1.env.CONTRACT_ADDRESS || "0x");
    }
    setContractAddress(address) {
        this.contractAddress = address;
    }
    async getServerBalance() {
        const balance = await this.publicClient.getBalance({
            address: this.account.address,
        });
        return (0, viem_1.formatEther)(balance);
    }
    async verifyPayment(gameId, playerAddress) {
        if (!this.contractAddress || this.contractAddress === "0x") {
            console.warn("⚠️ Contract address not set, skipping payment verification");
            return true; // For testing without deployed contract
        }
        try {
            const hasPaid = await this.publicClient.readContract({
                address: this.contractAddress,
                abi: contract_abi_json_1.default,
                functionName: "hasPlayerPaid",
                args: [gameId, playerAddress],
            });
            return hasPaid;
        }
        catch (error) {
            console.error("Error verifying payment:", error);
            return false;
        }
    }
    async getGamePool(gameId) {
        if (!this.contractAddress || this.contractAddress === "0x") {
            return "0";
        }
        try {
            const pool = await this.publicClient.readContract({
                address: this.contractAddress,
                abi: contract_abi_json_1.default,
                functionName: "getGamePool",
                args: [gameId],
            });
            return (0, viem_1.formatEther)(pool);
        }
        catch (error) {
            console.error("Error getting game pool:", error);
            return "0";
        }
    }
    async declareWinner(gameId, winnerAddress) {
        if (!this.contractAddress || this.contractAddress === "0x") {
            throw new Error("Contract address not set");
        }
        try {
            console.log(`🏆 Declaring winner for game ${gameId}: ${winnerAddress}`);
            const { request } = await this.publicClient.simulateContract({
                account: this.account,
                address: this.contractAddress,
                abi: contract_abi_json_1.default,
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
        }
        catch (error) {
            console.error("❌ Error declaring winner:", error);
            throw error;
        }
    }
    async getPlayerCount(gameId) {
        if (!this.contractAddress || this.contractAddress === "0x") {
            return 0;
        }
        try {
            const count = await this.publicClient.readContract({
                address: this.contractAddress,
                abi: contract_abi_json_1.default,
                functionName: "getPlayerCount",
                args: [gameId],
            });
            return Number(count);
        }
        catch (error) {
            console.error("Error getting player count:", error);
            return 0;
        }
    }
    getEntryFee() {
        return env_1.env.ENTRY_FEE_MON.toString();
    }
}
exports.blockchainService = new BlockchainService();
//# sourceMappingURL=blockchain.service.js.map