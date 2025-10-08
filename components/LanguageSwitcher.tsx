import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { languages } from '../constants/languages';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, loading } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedLanguage = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (langCode: string) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors duration-200"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="text-xl font-semibold text-[var(--accent-secondary-dark)]">{selectedLanguage.symbol}</span>
                <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:inline">{selectedLanguage.name}</span>
                <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 {loading && <div className="ml-2 w-4 h-4 border-2 border-dashed rounded-full animate-spin border-[var(--accent-primary)]"></div>}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--border-color-heavy)] z-20">
                    <ul className="py-1">
                        {languages.map(lang => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => handleSelect(lang.code)}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${language === lang.code ? 'bg-[var(--border-color)] text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)]'}`}
                                    role="menuitem"
                                >
                                    <span className="text-xl font-semibold text-[var(--accent-secondary-dark)] w-6 text-center">{lang.symbol}</span>
                                    <span>{lang.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
