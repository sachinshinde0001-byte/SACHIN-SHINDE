import React from 'react';
import { featuredCartoon } from '../mock/cartoonOfTheWeekData';
import { CharacterCard } from './CharacterCard';

export const CartoonOfTheWeek: React.FC = () => {
    return (
        <section className="mt-12 mb-8">
            <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-2">🌟 Cartoon of the Week 🌟</h2>
            <p className="text-center text-[var(--text-secondary)] mb-8">Check out this amazing creation from our community!</p>

            <div className="bg-[var(--bg-secondary)] rounded-xl p-6 shadow-themed border border-[var(--border-color)]">
                <header className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{featuredCartoon.title}</h3>
                    <p className="mt-1 text-md text-[var(--text-secondary)] italic">{featuredCartoon.logline}</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {featuredCartoon.characters.map(character => (
                        <CharacterCard 
                            key={character.name} 
                            character={character} 
                            language="en" 
                            onVoiceChange={() => {}} 
                        />
                    ))}
                </div>

                <footer className="text-center text-sm text-[var(--text-muted)]">
                    <p>Created by: <span className="font-semibold text-[var(--text-secondary)]">{featuredCartoon.userName}</span></p>
                    <p className="mt-2 font-medium">❤️ {featuredCartoon.likes?.toLocaleString()} Likes</p>
                </footer>
            </div>
        </section>
    );
};
