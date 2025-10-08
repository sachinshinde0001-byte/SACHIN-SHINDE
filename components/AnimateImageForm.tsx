import React, { useState, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { LoadingSpinner } from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

interface AnimateImageFormProps {
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  animationPrompt: string;
  setAnimationPrompt: (prompt: string) => void;
  onGenerateImage: () => void;
  isLoadingImage: boolean;
  onUploadImage: (file: File) => void;
  imageError: string | null;
  imageToAnimate: { url: string; base64: string } | null;
  clearImage: () => void;
  onAnimate: () => void;
  isAnimating: boolean;
  videoUrl: string | null;
  videoGenerationError: string | null;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
}

const ImageUploader: React.FC<{ onUpload: (file: File) => void; disabled: boolean; }> = ({ onUpload, disabled }) => {
    const { t } = useLanguage();
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    }, [onUpload]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag} 
            onDragLeave={handleDrag} 
            onDrop={handleDrop}
            className={`p-6 border-2 border-dashed rounded-xl text-center transition-colors duration-300 ${isDragging ? 'border-[var(--accent-secondary-dark)] bg-[var(--border-color)]' : 'border-[var(--border-color-heavy)] bg-[var(--bg-primary)]'}`}
        >
            <input type="file" id="image-upload" className="hidden" onChange={handleChange} accept="image/png, image/jpeg" disabled={disabled} />
            <label htmlFor="image-upload" className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.121 15.121A3 3 0 1010 14.828A3 3 0 0014.121 15.121z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" /></svg>
                <p className="text-[var(--text-secondary)] font-semibold">{t('imageUploaderDragLabel')}</p>
                <p className="text-sm text-[var(--text-muted)]">{t('imageUploaderBrowseLabel')}</p>
            </label>
        </div>
    );
};


export const AnimateImageForm: React.FC<AnimateImageFormProps> = ({ 
    imagePrompt, setImagePrompt, animationPrompt, setAnimationPrompt, 
    onGenerateImage, isLoadingImage, onUploadImage, imageError, 
    imageToAnimate, clearImage, onAnimate, isAnimating,
    videoUrl, videoGenerationError, aspectRatio, setAspectRatio
}) => {
    const { t } = useLanguage();
    
    const animationStyles = [
        { name: t('animationStyleHappy'), prompt: 'The character looks happy, smiling and bouncing slightly.' },
        { name: t('animationStyleWalking'), prompt: 'The character is walking from left to right.' },
        { name: t('animationStyleDancing'), prompt: 'The character does a simple, fun dance.' },
        { name: t('animationStyleWaving'), prompt: 'The character waves hello to the camera.' },
    ];

    const disabled = isLoadingImage || isAnimating;
    
    if (isAnimating || videoUrl || videoGenerationError) {
        return (
             <div className="bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-6 shadow-themed border border-[var(--border-color)]">
                <VideoPlayer 
                    isGeneratingVideo={isAnimating}
                    videoUrl={videoUrl}
                    videoGenerationError={videoGenerationError}
                    title={imagePrompt || t('myAnimationTitle')}
                    onGenerateVideo={() => {}} // Not used here
                    showGenerateButton={false}
                />
             </div>
        )
    }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-6 shadow-themed border border-[var(--border-color)] space-y-8">
      {!imageToAnimate ? (
        <div>
            <h2 className="text-2xl font-bold text-center mb-1 text-[var(--text-primary)]">{t('animateTitle')} ✨</h2>
            <p className="text-center text-[var(--text-secondary)] mb-6">{t('animateSubtitle')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-center text-[var(--text-secondary)] mb-2">{t('animateUploadStep')}</h3>
                    <ImageUploader onUpload={onUploadImage} disabled={disabled} />
                </div>
                
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center text-lg font-bold text-[var(--text-muted)] my-2 md:my-0">{t('orSeparator')}</div>
                </div>

                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-center text-[var(--text-secondary)] mb-2">{t('animateGenerateStep')}</h3>
                    <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder={t('animateImagePlaceholder')}
                        className="w-full h-24 p-3 bg-[var(--bg-primary)] border border-[var(--border-color-heavy)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary-dark)] transition-shadow duration-200 resize-y"
                        disabled={disabled}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow">
                            <label htmlFor="aspect-ratio-select" className="text-sm font-medium text-[var(--text-secondary)]">{t('aspectRatioLabel')}:</label>
                             <select
                                id="aspect-ratio-select"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                disabled={disabled}
                                className="w-full mt-1 p-2 bg-[var(--bg-primary)] border border-[var(--border-color-heavy)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary-dark)]"
                            >
                                <option value="1:1">{t('aspectRatioSquare')}</option>
                                <option value="16:9">{t('aspectRatioLandscape')}</option>
                                <option value="9:16">{t('aspectRatioPortrait')}</option>
                                <option value="4:3">{t('aspectRatioStandard')}</option>
                                <option value="3:4">{t('aspectRatioTall')}</option>
                            </select>
                        </div>
                        <button
                            onClick={onGenerateImage}
                            disabled={disabled || !imagePrompt.trim()}
                            className="w-full sm:w-auto h-full mt-auto flex items-center justify-center bg-gradient-to-r from-[var(--accent-secondary-dark)] to-[var(--accent-primary-dark)] hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] text-[var(--text-inverted)] font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isLoadingImage ? t('generatingButton') : t('generateButton')}
                        </button>
                    </div>
                </div>
            </div>
            {isLoadingImage && <div className="mt-4"><LoadingSpinner message={t('loadingConjuringImage')} /></div>}
            {imageError && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{imageError}</div>}
        </div>
      ) : (
        <div>
            <div className="relative max-w-lg mx-auto">
                <img src={imageToAnimate.url} alt="Image to animate" className="rounded-lg shadow-lg w-full border-2 border-[var(--border-color-heavy)]" />
                <button onClick={clearImage} className="absolute -top-2 -right-2 bg-[var(--bg-secondary)] rounded-full p-1.5 shadow-md hover:scale-110 transition-transform" aria-label={t('clearImageAriaLabel')}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-muted)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </button>
            </div>
            
            <div className="mt-8">
                 <h3 className="text-lg font-semibold text-center text-[var(--text-secondary)] mb-4">{t('animateChooseStyleStep')}</h3>
                 <div className="flex flex-wrap justify-center gap-2 mb-4">
                     {animationStyles.map(style => (
                         <button key={style.name} onClick={() => setAnimationPrompt(style.prompt)} className="px-4 py-2 text-sm rounded-full border-2 border-[var(--accent-primary)] text-[var(--accent-primary-dark)] font-semibold hover:bg-[var(--accent-primary)] hover:text-white transition-colors">
                             {style.name}
                         </button>
                     ))}
                 </div>
                 <textarea
                    value={animationPrompt}
                    onChange={(e) => setAnimationPrompt(e.target.value)}
                    placeholder={t('animateCustomPlaceholder')}
                    className="w-full h-24 p-3 bg-[var(--bg-primary)] border border-[var(--border-color-heavy)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary-dark)] transition-shadow duration-200 resize-y"
                    disabled={disabled}
                />
            </div>

            <button
                onClick={onAnimate}
                disabled={disabled || !animationPrompt.trim()}
                className="mt-6 w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-4 rounded-lg shadow-lg text-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t('animateButton')} 🪄
            </button>
        </div>
      )}
    </div>
  );
};