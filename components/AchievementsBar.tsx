import React, { useState } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { achievements } from '../constants/gamification';
import { AchievementsModal } from './AchievementsModal';

export const AchievementsBar: React.FC = () => {
    const { points, unlockedAchievements } = useGamification();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const unlockedCount = unlockedAchievements.size;
    const totalCount = achievements.length;
    const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return (
        <>
            <div className="flex items-center space-x-4">
                <div className="font-bold text-lg text-[var(--text-primary)]">
                    <span className="text-yellow-500">⭐</span> {points}
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors"
                    aria-label="View achievements"
                >
                    <span className="text-xl">🏆</span>
                    <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:inline">Achievements</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{unlockedCount}/{totalCount}</span>
                    <div className="w-16 h-2 bg-[var(--border-color)] rounded-full overflow-hidden hidden md:block">
                        <div 
                            className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${progress}%`}}
                        ></div>
                    </div>
                </button>
            </div>
            <AchievementsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};
