"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPING_TEXTS = void 0;
exports.getRandomText = getRandomText;
exports.calculateWPM = calculateWPM;
exports.calculateProgress = calculateProgress;
exports.TYPING_TEXTS = [
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
function getRandomText() {
    return exports.TYPING_TEXTS[Math.floor(Math.random() * exports.TYPING_TEXTS.length)];
}
function calculateWPM(charactersTyped, timeElapsedSeconds) {
    if (timeElapsedSeconds === 0)
        return 0;
    const words = charactersTyped / 5; // Standard: 5 characters = 1 word
    const minutes = timeElapsedSeconds / 60;
    return Math.round(words / minutes);
}
function calculateProgress(typedLength, totalLength) {
    if (totalLength === 0)
        return 0;
    return Math.min(100, Math.round((typedLength / totalLength) * 100));
}
//# sourceMappingURL=typing.js.map