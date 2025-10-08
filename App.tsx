import React, { useState, useEffect, useCallback } from 'react';
import { IdeaForm } from './components/IdeaForm';
import { ScriptForm } from './components/ScriptForm';
import { AnimateImageForm } from './components/AnimateImageForm';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CartoonIdea, Character } from './types';
import * as geminiService from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { CartoonOfTheWeek } from './components/CartoonOfTheWeek';
import { AchievementsBar } from './components/AchievementsBar';
import { PointsToast } from './components/PointsToast';
import { Confetti } from './components/Confetti';
import { useGamification } from './contexts/GamificationContext';
import { ActionType } from './constants/gamification';

type View = 'idea' | 'script' | 'animate';

const App: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { addPoints, showConfetti } = useGamification();

  // Global state
  const [view, setView] = useState<View>('idea');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartoonIdea, setCartoonIdea] = useState<CartoonIdea | null>(null);
  const [generationLanguage, setGenerationLanguage] = useState<string>(language);

  // IdeaForm state
  const [prompt, setPrompt] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // ScriptForm state
  const [script, setScript] = useState('');
  
  // ResultDisplay state
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoGenerationError, setVideoGenerationError] = useState<string | null>(null);

  // AnimateImageForm state
  const [imagePrompt, setImagePrompt] = useState('');
  const [animationPrompt, setAnimationPrompt] = useState('');
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageToAnimate, setImageToAnimate] = useState<{ url: string; base64: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationVideoUrl, setAnimationVideoUrl] = useState<string | null>(null);
  const [animationVideoError, setAnimationVideoError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  const resetState = () => {
    setCartoonIdea(null);
    setError(null);
    setPrompt('');
    setScript('');
    setVideoUrl(null);
    setVideoGenerationError(null);
    setImageToAnimate(null);
    setAnimationVideoUrl(null);
    setAnimationVideoError(null);
  };
  
  const handleViewChange = (newView: View) => {
      resetState();
      setView(newView);
  }

  const handleGenerateIdea = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setCartoonIdea(null);
    setVideoUrl(null);
    setVideoGenerationError(null);
    setGenerationLanguage(language);

    try {
      const idea = await geminiService.generateCartoonIdea(prompt, language);
      addPoints(ActionType.GENERATE_IDEA, 'New concept created!');

      const charactersWithImages = await Promise.all(
        idea.characters.map(async (char: Character) => {
          try {
            const { url, base64 } = await geminiService.generateCharacterImage(char.visual_prompt, '1:1');
            addPoints(ActionType.GENERATE_CHARACTER_IMAGE, `Image for ${char.name} generated!`);
            return { ...char, imageUrl: url, base64Image: base64 };
          } catch (e) {
            console.error(`Failed to generate image for ${char.name}:`, e);
            return char; // Return character without image if generation fails
          }
        })
      );

      setCartoonIdea({ ...idea, characters: charactersWithImages });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, language, addPoints]);

  const handleSuggestIdea = async () => {
    setIsSuggesting(true);
    try {
      const suggestion = await geminiService.suggestCartoonIdea(language);
      setPrompt(suggestion);
    } catch (err) {
      // a simple alert for now
      alert("Could not fetch a suggestion. Please try again.");
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handleGenerateFromScript = useCallback(async () => {
      if (!script.trim()) return;
      setIsLoading(true);
      setError(null);
      setCartoonIdea(null);
      setGenerationLanguage(language);
      
      try {
          const idea = await geminiService.parseScriptToCartoonIdea(script, language);
          addPoints(ActionType.GENERATE_IDEA, 'Idea parsed from script!');

          const charactersWithImages = await Promise.all(
              idea.characters.map(async (char: Character) => {
                  try {
                      const { url, base64 } = await geminiService.generateCharacterImage(char.visual_prompt, '1:1');
                       addPoints(ActionType.GENERATE_CHARACTER_IMAGE, `Image for ${char.name} generated!`);
                      return { ...char, imageUrl: url, base64Image: base64 };
                  } catch (e) {
                      console.error(`Failed to generate image for ${char.name}:`, e);
                      return char;
                  }
              })
          );
          setCartoonIdea({ ...idea, characters: charactersWithImages });
      } catch (err: any) {
          setError(err.message || 'An unknown error occurred analyzing the script.');
      } finally {
          setIsLoading(false);
      }
  }, [script, language, addPoints]);

  const handleGenerateScript = useCallback(async () => {
    if (!cartoonIdea) return;
    setIsGeneratingScript(true);
    try {
      const scriptData = await geminiService.generateScriptFromIdea(cartoonIdea, generationLanguage);
      setCartoonIdea(prev => prev ? { ...prev, ...scriptData } : null);
      addPoints(ActionType.GENERATE_SCRIPT, 'Script finished!');
    } catch (err: any) {
      setError(err.message || "Failed to generate script.");
    } finally {
      setIsGeneratingScript(false);
    }
  }, [cartoonIdea, generationLanguage, addPoints]);

  const handleGenerateVideo = useCallback(async () => {
      if (!cartoonIdea) return;
      setIsGeneratingVideo(true);
      setVideoUrl(null);
      setVideoGenerationError(null);
      try {
          const url = await geminiService.generateStoryVideo(cartoonIdea);
          setVideoUrl(url);
          addPoints(ActionType.GENERATE_VIDEO, 'Video rendered!');
      } catch (err: any) {
          setVideoGenerationError(err.message || "An unknown error occurred during video generation.");
      } finally {
          setIsGeneratingVideo(false);
      }
  }, [cartoonIdea, addPoints]);
  
  const handleVoiceChange = (characterName: string, voiceName: string) => {
      setCartoonIdea(prev => {
          if (!prev) return null;
          return {
              ...prev,
              characters: prev.characters.map(c => c.name === characterName ? { ...c, voice: voiceName } : c)
          }
      });
  };

  // Animate Image handlers
  const handleGenerateImageForAnimation = async () => {
    if (!imagePrompt.trim()) return;
    setIsLoadingImage(true);
    setImageError(null);
    try {
      const image = await geminiService.generateCharacterImage(imagePrompt, aspectRatio);
      setImageToAnimate(image);
      addPoints(ActionType.GENERATE_CHARACTER_IMAGE, 'Image generated for animation!');
    } catch (err: any) {
      setImageError(err.message || 'Failed to generate image.');
    } finally {
      setIsLoadingImage(false);
    }
  };
  
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const url = e.target?.result as string;
        const base64 = url.split(',')[1];
        setImageToAnimate({ url, base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleAnimateImage = async () => {
    if (!imageToAnimate || !animationPrompt.trim()) return;
    setIsAnimating(true);
    setAnimationVideoUrl(null);
    setAnimationVideoError(null);
    try {
      const url = await geminiService.generateVideoFromImage(imageToAnimate.base64, animationPrompt);
      setAnimationVideoUrl(url);
      addPoints(ActionType.ANIMATE_IMAGE, 'Image animated!');
    } catch (err: any) {
      setAnimationVideoError(err.message || 'Failed to animate image.');
    } finally {
      setIsAnimating(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message={t('generatingButton')} />;
    }
    if (error) {
      return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }
    if (cartoonIdea) {
      return (
        <ResultDisplay
          idea={cartoonIdea}
          generationLanguage={generationLanguage}
          onVoiceChange={handleVoiceChange}
          onGenerateScript={handleGenerateScript}
          isGeneratingScript={isGeneratingScript}
          onGenerateVideo={handleGenerateVideo}
          isGeneratingVideo={isGeneratingVideo}
          videoUrl={videoUrl}
          videoGenerationError={videoGenerationError}
        />
      );
    }
    switch (view) {
      case 'idea':
        return <IdeaForm 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  language={language}
                  setLanguage={setLanguage}
                  onSubmit={handleGenerateIdea}
                  isLoading={isLoading}
                  onSuggestIdea={handleSuggestIdea}
                  isSuggesting={isSuggesting}
               />;
      case 'script':
          return <ScriptForm 
                    script={script}
                    setScript={setScript}
                    language={language}
                    setLanguage={setLanguage}
                    onSubmit={handleGenerateFromScript}
                    isLoading={isLoading}
                 />;
      case 'animate':
          return <AnimateImageForm 
                    imagePrompt={imagePrompt}
                    setImagePrompt={setImagePrompt}
                    animationPrompt={animationPrompt}
                    setAnimationPrompt={setAnimationPrompt}
                    onGenerateImage={handleGenerateImageForAnimation}
                    isLoadingImage={isLoadingImage}
                    onUploadImage={handleUploadImage}
                    imageError={imageError}
                    imageToAnimate={imageToAnimate}
                    clearImage={() => setImageToAnimate(null)}
                    onAnimate={handleAnimateImage}
                    isAnimating={isAnimating}
                    videoUrl={animationVideoUrl}
                    videoGenerationError={animationVideoError}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      {showConfetti && <Confetti />}
      <PointsToast />
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">{t('mainTitle')}</h1>
            <p className="text-[var(--text-secondary)] mt-1">{t('mainSubtitle')}</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
             <AchievementsBar />
             <LanguageSwitcher />
          </div>
        </header>

        <main>
          <div className="mb-6">
            <div className="flex justify-center border-b border-[var(--border-color)]">
                <button onClick={() => handleViewChange('idea')} className={`px-4 py-2 font-semibold transition-colors ${view === 'idea' ? 'border-b-2 border-[var(--accent-primary-dark)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>{t('fromIdeaTab')}</button>
                <button onClick={() => handleViewChange('script')} className={`px-4 py-2 font-semibold transition-colors ${view === 'script' ? 'border-b-2 border-[var(--accent-primary-dark)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>{t('fromScriptTab')}</button>
                <button onClick={() => handleViewChange('animate')} className={`px-4 py-2 font-semibold transition-colors ${view === 'animate' ? 'border-b-2 border-[var(--accent-primary-dark)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>{t('animateImageTab')}</button>
            </div>
          </div>
          {renderContent()}
          {!cartoonIdea && view !== 'animate' && <CartoonOfTheWeek />}
        </main>
      </div>
    </div>
  );
};

export default App;
