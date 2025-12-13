'use client';

import { useState, useCallback, useEffect } from 'react';
import { calculateWPM, calculateProgress, calculateAccuracy } from '@/lib/game/typing-utils';

export function useTyping(targetText: string, onProgressUpdate?: (progress: number, wpm: number) => void) {
    const [typedText, setTypedText] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isComplete, setIsComplete] = useState(false);
    const [correctChars, setCorrectChars] = useState(0);

    // Start typing timer
    const startTyping = useCallback(() => {
        if (!startTime) {
            setStartTime(Date.now());
        }
    }, [startTime]);

    // Reset typing state
    const reset = useCallback(() => {
        setTypedText('');
        setStartTime(null);
        setProgress(0);
        setWpm(0);
        setAccuracy(100);
        setIsComplete(false);
        setCorrectChars(0);
    }, []);

    // Handle character input
    const handleInput = useCallback(
        (char: string) => {
            if (isComplete) return;

            // Start timer on first character
            if (!startTime) {
                setStartTime(Date.now());
            }

            const currentIndex = typedText.length;
            const expectedChar = targetText[currentIndex];

            // Only accept the correct character
            if (char === expectedChar) {
                const newTypedText = typedText + char;
                setTypedText(newTypedText);
                setCorrectChars((prev) => prev + 1);

                // Calculate metrics
                const newProgress = calculateProgress(newTypedText.length, targetText.length);
                const timeElapsed = (Date.now() - (startTime || Date.now())) / 1000;
                const newWpm = calculateWPM(newTypedText.length, timeElapsed);
                const newAccuracy = calculateAccuracy(correctChars + 1, newTypedText.length);

                setProgress(newProgress);
                setWpm(newWpm);
                setAccuracy(newAccuracy);

                // Check if complete
                if (newTypedText.length === targetText.length) {
                    setIsComplete(true);
                }

                // Notify parent component
                if (onProgressUpdate) {
                    onProgressUpdate(newProgress, newWpm);
                }
            }
        },
        [typedText, targetText, startTime, isComplete, correctChars, onProgressUpdate]
    );

    return {
        typedText,
        progress,
        wpm,
        accuracy,
        isComplete,
        startTyping,
        handleInput,
        reset,
    };
}
