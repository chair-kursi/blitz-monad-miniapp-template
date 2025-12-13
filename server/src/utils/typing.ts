export const TYPING_TEXTS = [
    "The quick brown fox jumps over the lazy dog near the riverbank.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "Blockchain technology enables decentralized applications to run without intermediaries.",
    "Typing speed matters less than accuracy when learning to code efficiently.",
    "Monad is a high-performance blockchain designed for scalability and speed.",
    "Farcaster is a decentralized social network built on open protocols.",
    "Smart contracts execute automatically when predetermined conditions are met.",
    "Web3 represents the next evolution of the internet with user ownership.",
    "Cryptography ensures security and privacy in blockchain transactions.",
    "Decentralization distributes power and control across network participants.",
];

export function getRandomText(): string {
    return TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
}

export function calculateWPM(
    charactersTyped: number,
    timeElapsedSeconds: number
): number {
    if (timeElapsedSeconds === 0) return 0;
    const words = charactersTyped / 5; // Standard: 5 characters = 1 word
    const minutes = timeElapsedSeconds / 60;
    return Math.round(words / minutes);
}

export function calculateProgress(
    typedLength: number,
    totalLength: number
): number {
    if (totalLength === 0) return 0;
    return Math.min(100, Math.round((typedLength / totalLength) * 100));
}
