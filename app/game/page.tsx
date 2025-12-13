'use client';

import { GameProvider } from '@/contexts/GameContext';
import { GameDashboard } from '@/components/Game/GameDashboard';

export default function GamePage() {
    return (
        <GameProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <GameDashboard />
            </div>
        </GameProvider>
    );
}
