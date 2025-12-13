'use client';

import { useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import contractABI from '@/lib/contract-abi.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const ENTRY_FEE = '0.01'; // 0.01 MON

export function useContract() {
    const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

    // CRITICAL FIX: Only watch transaction when hash exists!
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
        query: {
            enabled: !!hash, // Only poll when we have a hash
        },
    });

    // Use ref to track if transaction is in progress (prevents double calls)
    const isProcessingRef = useRef(false);

    const payEntryFee = (gameId: string) => {
        if (!CONTRACT_ADDRESS) {
            console.error('❌ Contract address not configured');
            return;
        }

        // CRITICAL: Check ref first (immediate, not stale)
        if (isProcessingRef.current) {
            console.log('⚠️ Transaction already in progress (ref check)');
            return;
        }

        // Check wagmi state
        if (isPending || hash) {
            console.log('⚠️ Transaction already pending (wagmi check)');
            return;
        }

        console.log('✅ Starting transaction for gameId:', gameId);

        // Set ref IMMEDIATELY before async call
        isProcessingRef.current = true;

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: contractABI,
                functionName: 'enterTournament',
                args: [BigInt(gameId)],
                value: parseEther(ENTRY_FEE),
            });
            console.log('💳 Transaction submitted');
        } catch (err) {
            console.error('❌ Transaction failed:', err);
            isProcessingRef.current = false; // Reset on error
            throw err;
        }
    };

    // Reset ref when transaction completes
    if (isSuccess && isProcessingRef.current) {
        console.log('✅ Transaction successful, resetting ref');
        isProcessingRef.current = false;
    }

    // Reset ref on error
    if (error && isProcessingRef.current) {
        console.log('❌ Transaction error, resetting ref');
        isProcessingRef.current = false;
    }

    return {
        payEntryFee,
        isPending,
        isConfirming,
        isSuccess,
        error,
        hash,
        reset,
    };
}
