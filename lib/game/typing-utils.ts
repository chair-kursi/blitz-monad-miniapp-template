/**
 * Calculate Words Per Minute (WPM)
 * Standard: 5 characters = 1 word
 */
export function calculateWPM(charactersTyped: number, timeElapsedSeconds: number): number {
    if (timeElapsedSeconds === 0) return 0;
    const words = charactersTyped / 5;
    const minutes = timeElapsedSeconds / 60;
    return Math.round(words / minutes);
}

/**
 * Calculate typing progress percentage
 */
export function calculateProgress(typedLength: number, totalLength: number): number {
    if (totalLength === 0) return 0;
    return Math.min(100, Math.round((typedLength / totalLength) * 100));
}

/**
 * Calculate typing accuracy
 */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
    if (totalChars === 0) return 100;
    return Math.round((correctChars / totalChars) * 100);
}

/**
 * Format time remaining (MM:SS)
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get character status (correct, incorrect, pending)
 */
export function getCharacterStatus(
    char: string,
    index: number,
    typedText: string,
    targetText: string
): 'correct' | 'incorrect' | 'current' | 'pending' {
    if (index < typedText.length) {
        return typedText[index] === targetText[index] ? 'correct' : 'incorrect';
    }
    if (index === typedText.length) {
        return 'current';
    }
    return 'pending';
}
