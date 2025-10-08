import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Achievement, achievements, ActionType, actionPoints } from '../constants/gamification';

interface PointsToastData {
    id: number;
    points: number;
    message: string;
}

interface GamificationContextType {
    points: number;
    unlockedAchievements: Set<string>;
    addPoints: (action: ActionType, message: string) => void;
    latestToast: PointsToastData | null;
    showConfetti: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [points, setPoints] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
    const [latestToast, setLatestToast] = useState<PointsToastData | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const unlockAchievement = useCallback((achievement: Achievement) => {
        if (!unlockedAchievements.has(achievement.id)) {
            setUnlockedAchievements(prev => new Set(prev).add(achievement.id));
            setPoints(p => p + achievement.points);
            // In a real app, you might show a specific achievement modal here
            console.log(`Achievement Unlocked: ${achievement.title}`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        }
    }, [unlockedAchievements]);

    const addPoints = useCallback((action: ActionType, message: string) => {
        const pointsToAdd = actionPoints[action];
        setPoints(p => p + pointsToAdd);
        setLatestToast({ id: Date.now(), points: pointsToAdd, message });

        // This is a simplified check. A real app might track counts in state.
        if (action === ActionType.GENERATE_IDEA && !unlockedAchievements.has('first_idea')) {
            unlockAchievement(achievements.find(a => a.id === 'first_idea')!);
        }
        if (action === ActionType.GENERATE_SCRIPT && !unlockedAchievements.has('first_script')) {
            unlockAchievement(achievements.find(a => a.id === 'first_script')!);
        }
        if (action === ActionType.GENERATE_CHARACTER_IMAGE && !unlockedAchievements.has('first_character')) {
            unlockAchievement(achievements.find(a => a.id === 'first_character')!);
        }
        if (action === ActionType.GENERATE_VIDEO && !unlockedAchievements.has('first_video')) {
            unlockAchievement(achievements.find(a => a.id === 'first_video')!);
        }
        if (action === ActionType.ANIMATE_IMAGE && !unlockedAchievements.has('first_animation')) {
            unlockAchievement(achievements.find(a => a.id === 'first_animation')!);
        }
    }, [unlockAchievement, unlockedAchievements]);

    return (
        <GamificationContext.Provider value={{ points, unlockedAchievements, addPoints, latestToast, showConfetti }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = (): GamificationContextType => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
