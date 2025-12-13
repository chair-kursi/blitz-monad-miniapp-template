'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import contractABI from '@/lib/contract-abi.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const ENTRY_FEE = '0.01'; // 0.01 MON

export function useContract() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const payEntryFee = async (gameId: string) => {
        if (!CONTRACT_ADDRESS) {
            throw new Error('Contract address not configured');
        }

        console.log('🎯 payEntryFee called for gameId:', gameId);
        console.log('📊 Current state - isPending:', isPending, 'hash:', hash);

        try {
            console.log('💳 Calling writeContract...');
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: contractABI,
                functionName: 'enterTournament',
                args: [BigInt(gameId)],
                value: parseEther(ENTRY_FEE),
            });
            console.log('✅ writeContract called successfully');
        } catch (err) {
            console.error('❌ Failed to pay entry fee:', err);
            throw err;
        }
    };

    return {
        payEntryFee,
        isPending,
        isConfirming,
        isSuccess,
        error,
        hash,
    };
}
