import { Address } from "viem";
declare class BlockchainService {
    private publicClient;
    private walletClient;
    private account;
    private contractAddress;
    constructor();
    setContractAddress(address: string): void;
    getServerBalance(): Promise<string>;
    verifyPayment(gameId: bigint, playerAddress: Address): Promise<boolean>;
    getGamePool(gameId: bigint): Promise<string>;
    declareWinner(gameId: bigint, winnerAddress: Address): Promise<string>;
    getPlayerCount(gameId: bigint): Promise<number>;
    getEntryFee(): string;
}
export declare const blockchainService: BlockchainService;
export {};
//# sourceMappingURL=blockchain.service.d.ts.map