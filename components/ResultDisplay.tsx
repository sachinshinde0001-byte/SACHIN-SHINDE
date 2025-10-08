import React from 'react';
import { CartoonIdea } from '../types';
import { CharacterCard } from './CharacterCard';
import { ScriptEditor } from './ScriptEditor';
import { VideoPlayer } from './VideoPlayer';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultDisplayProps {
  idea: CartoonIdea;
  generationLanguage: string;
  onVoiceChange: (characterName: string, voiceName: string) => void;
  onGenerateVideo: () => void;
  isGeneratingVideo: boolean;
  videoUrl: string | null;
  videoGenerationError: string | null;
  onGenerateScript: () => void;
  isGeneratingScript: boolean;
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-[var(--text-primary)] border-b-2 border-[var(--accent-primary-dark)] pb-2 mb-6 mt-12 first:mt-0">
        {children}
    </h2>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  idea,
  generationLanguage,
  onVoiceChange,
  onGenerateVideo,
  isGeneratingVideo,
  videoUrl,
  videoGenerationError,
  onGenerateScript,
  isGeneratingScript,
}) => {
    const { t } = useLanguage();

  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-[var(--text-primary)]">{idea.title}</h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)] italic">{idea.logline}</p>
      </header>

      <section>
        <SectionHeader>{t('charactersSectionHeader')}</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {idea.characters.map((character) => (
            <CharacterCard
              key={character.name}
              character={character}
              language={generationLanguage}
              onVoiceChange={onVoiceChange}
            />
          ))}
        </div>
      </section>

      {idea.scenes && idea.moral && idea.music_suggestions ? (
        <ScriptEditor 
            scenes={idea.scenes}
            musicSuggestions={idea.music_suggestions}
            moral={idea.moral}
            onRegenerate={onGenerateScript}
            isRegenerating={isGeneratingScript}
            characters={idea.characters}
        />
      ) : (
        <div className="text-center">
            <button
                onClick={onGenerateScript}
                disabled={isGeneratingScript}
                className="mt-4 w-full max-w-sm flex items-center justify-center bg-gradient-to-r from-[var(--accent-secondary-dark)] to-[var(--accent-primary-dark)] hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] text-[var(--text-inverted)] font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isGeneratingScript ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('generatingButton')}
                    </>
                ) : (
                    t('generateScriptButton')
                )}
            </button>
        </div>
      )}

      <VideoPlayer 
        isGeneratingVideo={isGeneratingVideo}
        videoUrl={videoUrl}
        videoGenerationError={videoGenerationError}
        title={idea.title}
        onGenerateVideo={onGenerateVideo}
        showGenerateButton={true}
      />
    </div>
  );
};
