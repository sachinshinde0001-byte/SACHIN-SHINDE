import React, { useState, useEffect } from 'react';
import { useGamification } from '../contexts/GamificationContext';

export const PointsToast: React.FC = () => {
    const { latestToast } = useGamification();
    const [visible, setVisible] = useState(false);
    const [currentToast, setCurrentToast] = useState(latestToast);

    useEffect(() => {
        if (latestToast) {
            setCurrentToast(latestToast);
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [latestToast]);

    if (!currentToast) return null;
    
    return (
         <div className={`fixed bottom-5 right-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold p-4 rounded-lg shadow-2xl transition-all duration-500 ease-in-out z-50 ${visible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'}`}>
            <div className="flex items-center space-x-3">
                <span className="text-2xl">🏆</span>
                <div>
                    <div>{currentToast.message}</div>
                    <div className="text-sm font-normal">+{currentToast.points} Points!</div>
                </div>
            </div>
        </div>
    );
};
