import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { languages } from '../constants/languages';

// For TypeScript: Add SpeechRecognition types to the window object
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface IdeaFormProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onSuggestIdea: () => void;
  isSuggesting: boolean;
}

export const IdeaForm: React.FC<IdeaFormProps> = ({ prompt, setPrompt, language, setLanguage, onSubmit, isLoading, onSuggestIdea, isSuggesting }) => {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn("SpeechRecognition API not supported by this browser.");
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setPrompt(prevPrompt => (prevPrompt ? prevPrompt.trim() + ' ' : '') + speechToText);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone access in your browser settings to use this feature.');
      }
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, setPrompt]);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-6 shadow-themed border border-[var(--border-color)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1">
            <label htmlFor="language-select" className="block text-lg font-medium text-[var(--text-secondary)] mb-2">
                {t('languageLabel')}:
            </label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color-heavy)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary-dark)] focus:border-[var(--accent-primary-dark)] transition-shadow duration-200"
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
        <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="cartoon-prompt" className="text-lg font-medium text-[var(--text-secondary)]">
                  {t('describeYourIdeaLabel')}:
              </label>
              <button 
                onClick={onSuggestIdea} 
                disabled={isLoading || isSuggesting}
                className="flex items-center text-sm font-semibold px-3 py-1 rounded-full border border-[var(--border-color-heavy)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSuggesting ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="mr-1">✨</span>
                )}
                {isSuggesting ? t('suggestingIdeaButton') : t('suggestIdeaButton')}
              </button>
            </div>
            <div className="relative w-full">
                <textarea
                id="cartoon-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ideaPlaceholder')}
                className="w-full h-24 p-3 pr-14 bg-[var(--bg-primary)] border border-[var(--border-color-heavy)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary-dark)] focus:border-[var(--accent-primary-dark)] transition-shadow duration-200 resize-none"
                disabled={isLoading}
                />
                {isSupported && (
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isLoading}
                    aria-label={isRecording ? t('stopRecordingAriaLabel') : t('startRecordingAriaLabel')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[var(--accent-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRecording ? (
                        <div className="w-6 h-6 flex items-center justify-center">
                            <style>{`
                                .wave-bar { animation: wave 1.2s linear infinite; transform-origin: bottom; }
                                .wave-bar:nth-child(2) { animation-delay: -0.2s; }
                                .wave-bar:nth-child(3) { animation-delay: -0.4s; }
                                @keyframes wave {
                                    0% { transform: scaleY(0.3); }
                                    20% { transform: scaleY(1); }
                                    40% { transform: scaleY(0.3); }
                                    100% { transform: scaleY(0.3); }
                                }
                            `}</style>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[var(--accent-primary-dark)]">
                                <g>
                                    <rect className="wave-bar" x="6" y="8" width="3" height="8" rx="1.5" />
                                    <rect className="wave-bar" x="10.5" y="5" width="3" height="14" rx="1.5" />
                                    <rect className="wave-bar" x="15" y="8" width="3" height="8" rx="1.5" />
                                </g>
                            </svg>
                        </div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 text-[var(--text-muted)] hover:text-[var(--accent-primary-dark)]`}>
                            <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2h2v2a5 5 0 0 0 10 0v-2h2z"></path>
                        </svg>
                    )}
                </button>
                )}
            </div>
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-4 w-full flex items-center justify-center bg-gradient-to-r from-[var(--accent-secondary-dark)] to-[var(--accent-primary-dark)] hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] text-[var(--text-inverted)] font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('generatingButton')}
          </>
        ) : (
          t('generateIdeaButton')
        )}
      </button>
    </div>
  );
};