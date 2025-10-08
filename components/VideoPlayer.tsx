import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface VideoPlayerProps {
    isGeneratingVideo: boolean;
    videoUrl: string | null;
    videoGenerationError: string | null;
    title: string;
    onGenerateVideo: () => void;
    showGenerateButton: boolean;
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-[var(--text-primary)] border-b-2 border-[var(--accent-primary-dark)] pb-2 mb-6">
        {children}
    </h2>
);

const VideoLoadingIndicator: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="text-center p-8 flex flex-col items-center justify-center space-y-4 mt-8">
            <style>{`
            @keyframes progress-animation {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            @keyframes sparkle {
                0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
            }
            .sparkle {
                position: absolute;
                width: 12px;
                height: 12px;
                animation: sparkle 1.5s infinite;
            }
            `}</style>
            <div className="w-full max-w-sm relative">
                <div className="h-6 w-full bg-[var(--border-color)] rounded-full overflow-hidden relative shadow-inner">
                    <div 
                        className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)]"
                        style={{ animation: 'progress-animation 2.5s ease-in-out infinite' }}
                    />
                </div>
                <div className="sparkle text-[var(--accent-secondary-dark)]" style={{ top: '-10px', left: '10%', animationDelay: '0s' }}>✨</div>
                <div className="sparkle text-[var(--accent-primary-dark)]" style={{ top: '50%', left: '25%', animationDelay: '0.3s' }}>🪄</div>
                <div className="sparkle text-[var(--accent-secondary-dark)]" style={{ top: '0px', left: '45%', animationDelay: '0.6s' }}>✨</div>
                <div className="sparkle text-[var(--accent-primary-dark)]" style={{ top: '60%', left: '65%', animationDelay: '0.9s' }}>🪄</div>
                <div className="sparkle text-[var(--accent-secondary-dark)]" style={{ top: '-5px', left: '85%', animationDelay: '1.2s' }}>✨</div>
            </div>
            <p className="text-[var(--text-secondary)] text-lg font-medium">{t('loadingVideo')}</p>
            <p className="text-[var(--text-muted)] text-sm">{t('loadingVideoSubtitle')}</p>
        </div>
    );
}


export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    isGeneratingVideo,
    videoUrl,
    videoGenerationError,
    title,
    onGenerateVideo,
    showGenerateButton
}) => {
    const { t } = useLanguage();
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // When a new video is generated, reset the playing state
    useEffect(() => {
        if (videoUrl) {
            setIsVideoPlaying(false);
        }
    }, [videoUrl]);

    const handleVideoPlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsVideoPlaying(true);
        }
    };

    if (isGeneratingVideo) {
        return <VideoLoadingIndicator />;
    }

    return (
        <section>
            <SectionHeader>{t('videoSectionHeader')}</SectionHeader>
            <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)] shadow-themed text-center">
            {showGenerateButton && !videoUrl && !isGeneratingVideo && (
                <>
                <p className="text-[var(--text-secondary)] mb-6" dangerouslySetInnerHTML={{ __html: t('videoGenerationPrompt') }} />
                <button
                    onClick={onGenerateVideo}
                    className="w-full max-w-sm mx-auto flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    {t('generateVideoButton')}
                </button>
                </>
            )}
            
            {videoGenerationError && (
                <div className="mt-4 bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] px-4 py-3 rounded-lg">
                <p><strong>{t('videoErrorLabel')}:</strong> {videoGenerationError}</p>
                </div>
            )}

            {videoUrl && (
                <div className="mt-4">
                <p className="text-lg font-semibold text-green-600 mb-4">{t('videoReadyMessage')}</p>
                <div className="relative aspect-video max-w-2xl mx-auto rounded-lg overflow-hidden border-2 border-[var(--border-color-heavy)] bg-black shadow-lg">
                    <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onEnded={() => setIsVideoPlaying(false)}
                    >
                    {t('videoUnsupported')}
                    </video>
                    {!isVideoPlaying && videoRef.current && videoRef.current.paused && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer" onClick={handleVideoPlay}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white opacity-80 hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex items-center justify-center space-x-4">
                    <a
                        href={videoUrl}
                        download={`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'cartoon'}.mp4`}
                        className="inline-flex items-center justify-center bg-gradient-to-r from-[var(--accent-secondary-dark)] to-[var(--accent-primary-dark)] hover:from-[var(--accent-secondary)] hover:to-[var(--accent-primary)] text-[var(--text-inverted)] font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {t('downloadButton')}
                    </a>
                    {showGenerateButton && (
                        <button
                            onClick={onGenerateVideo}
                            className="inline-flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            {t('animateAgainButton')}
                        </button>
                    )}
                </div>
                </div>
            )}
            </div>
        </section>
    );
};