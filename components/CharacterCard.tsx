import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Character } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CharacterCardProps {
  character: Character;
  language: string;
  onVoiceChange: (characterName: string, voiceName: string) => void;
}

const ImageSkeleton: React.FC = () => (
    <div className="w-full h-56 bg-[var(--border-color)] rounded-t-lg animate-pulse flex items-center justify-center">
        <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg>
    </div>
);

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, language, onVoiceChange }) => {
  const { t } = useLanguage();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isDescriptionPlaying, setIsDescriptionPlaying] = useState(false);
  const descriptionUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    const voiceInterval = setInterval(() => {
        const availableVoices = speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
            clearInterval(voiceInterval);
        }
    }, 100);

    return () => {
      speechSynthesis.onvoiceschanged = null;
      clearInterval(voiceInterval);
      // General cleanup for any speech from this component
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  const filteredVoices = useMemo(() => {
    const langCode = language.split('-')[0];
    return voices.filter(voice => voice.lang.startsWith(langCode));
  }, [voices, language]);

  const handlePlayDescription = () => {
    speechSynthesis.cancel(); // Stop any other playing audio
    if (isDescriptionPlaying) {
      setIsDescriptionPlaying(false);
      descriptionUtteranceRef.current = null;
    } else {
      const utterance = new SpeechSynthesisUtterance(character.description);
      utterance.lang = language;
      utterance.onend = () => {
        setIsDescriptionPlaying(false);
        descriptionUtteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsDescriptionPlaying(false);
        descriptionUtteranceRef.current = null;
        console.error("Error playing character description");
      };
      descriptionUtteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
      setIsDescriptionPlaying(true);
    }
  };

  const handleTestVoice = () => {
    speechSynthesis.cancel(); // Stop any other playing audio
    if (isTestingVoice) {
        setIsTestingVoice(false);
        return;
    }

    if (!character.voice) return;

    const voiceToUse = voices.find(v => v.name === character.voice);
    if (voiceToUse) {
        const utterance = new SpeechSynthesisUtterance(t('testVoiceText', { name: character.name }));
        utterance.voice = voiceToUse;
        utterance.lang = language;
        utterance.onend = () => setIsTestingVoice(false);
        utterance.onerror = () => {
            console.error("Error playing test voice.");
            setIsTestingVoice(false);
        };
        speechSynthesis.speak(utterance);
        setIsTestingVoice(true);
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg overflow-hidden shadow-themed border border-[var(--border-color)] h-full flex flex-col transition-transform transform hover:-translate-y-1">
      {character.imageUrl ? (
        <img 
            src={character.imageUrl} 
            alt={`AI generated image of ${character.name}`} 
            className="w-full h-56 object-cover"
        />
      ) : (
        <ImageSkeleton />
      )}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-[var(--accent-primary-dark)]">{character.name}</h3>
        <div className="flex items-start justify-between mt-2 flex-grow">
          <p className="text-[var(--text-secondary)] flex-grow pr-2">{character.description}</p>
          <button
            onClick={handlePlayDescription}
            className="p-1.5 rounded-full hover:bg-[var(--border-color)] transition-colors duration-150 flex-shrink-0"
            aria-label={isDescriptionPlaying ? t('stopReadAloudAriaLabel') : t('readAloudAriaLabel')}
          >
            {isDescriptionPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--accent-primary-dark)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {filteredVoices.length > 0 && (
          <div className="mt-4">
            <label htmlFor={`voice-select-${character.name}`} className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              {t('voiceLabel')}:
            </label>
            <div className="flex items-center space-x-2">
                <select
                id={`voice-select-${character.name}`}
                value={character.voice || ''}
                onChange={(e) => onVoiceChange(character.name, e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base bg-[var(--bg-primary)] border-[var(--border-color-heavy)] focus:outline-none focus:ring-[var(--accent-primary-dark)] focus:border-[var(--accent-primary-dark)] sm:text-sm rounded-md"
                aria-label={t('voiceSelectAriaLabel', { name: character.name })}
                >
                <option value="">{t('voiceSelectDefault')}</option>
                {filteredVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.name}>
                    {`${voice.name} (${voice.lang})`}
                    </option>
                ))}
                </select>
                <button
                    onClick={handleTestVoice}
                    disabled={!character.voice}
                    aria-label={t('testVoiceAriaLabel')}
                    className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isTestingVoice ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-primary)]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};