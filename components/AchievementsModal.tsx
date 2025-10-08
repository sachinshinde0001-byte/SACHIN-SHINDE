import React from 'react';
import { achievements } from '../constants/gamification';
import { useGamification } from '../contexts/GamificationContext';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { unlockedAchievements } = useGamification();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-[var(--bg-secondary)] rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Achievements</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors" aria-label="Close achievements modal">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <ul className="space-y-4">
          {achievements.map(ach => (
            <li key={ach.id} className={`flex items-start space-x-4 p-4 rounded-lg border transition-opacity ${unlockedAchievements.has(ach.id) ? 'border-[var(--accent-primary)] bg-[var(--bg-primary)]' : 'border-[var(--border-color)] opacity-60'}`}>
              <span className="text-4xl">{unlockedAchievements.has(ach.id) ? ach.icon : '❓'}</span>
              <div>
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{ach.title}</h3>
                <p className="text-[var(--text-secondary)]">{ach.description}</p>
                <p className="text-sm font-semibold text-[var(--accent-primary-dark)] mt-1">+{ach.points} Points</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
