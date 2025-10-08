import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { uiStrings as englishStrings } from '../constants/uiStrings';
import { languages } from '../constants/languages';
import { translateText } from '../services/geminiService';

interface LanguageContextType {
    language: string;
    setLanguage: (language: string) => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
    loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>('en');
    const [translations, setTranslations] = useState<Record<string, string>>(englishStrings);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('appLanguage');
        if (savedLang) {
            setLanguageState(savedLang);
        } else {
            const browserLang = navigator.language.split('-')[0];
            const supportedLang = languages.find(l => l.code.startsWith(browserLang));
            setLanguageState(supportedLang ? supportedLang.code : 'en');
        }
    }, []);

    const setLanguage = useCallback((lang: string) => {
        setLanguageState(lang);
        localStorage.setItem('appLanguage', lang);
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;

        if (language === 'en') {
            setTranslations(englishStrings);
            return;
        }

        const fetchTranslations = async () => {
            setLoading(true);
            try {
                const langInfo = languages.find(l => l.code === language);
                if (langInfo) {
                    const translatedStrings = await translateText(englishStrings, langInfo.name);
                    setTranslations(translatedStrings);
                }
            } catch (error) {
                console.error('Failed to fetch translations:', error);
                setTranslations(englishStrings); // Fallback to English
            } finally {
                setLoading(false);
            }
        };

        fetchTranslations();

    }, [language]);
    
    const t = useCallback((key: string, replacements?: { [key: string]: string }) => {
        let translation = translations[key] || englishStrings[key] || key;
        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
            });
        }
        return translation;
    }, [translations]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
