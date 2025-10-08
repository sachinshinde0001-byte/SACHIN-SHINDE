import React, { useState, useEffect, useRef } from 'react';
import { Scene, Character } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ScriptEditorProps {
    scenes: Scene[];
    musicSuggestions: string[];
    moral: string;
    onRegenerate: () => void;
    isRegenerating: boolean;
    characters: Character[];
}

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-3xl font-bold text-[var(--text-primary)] border-b-2 border-[var(--accent-primary-dark)] pb-2 mb-6">
        {children}
    </h2>
);

const ToolbarButton: React.FC<{ onClick: () => void; disabled: boolean; label: string; children: React.ReactNode; }> = ({ onClick, disabled, label, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color-heavy)] hover:bg-[var(--border-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={label}
    >
        {children}
    </button>
);

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ scenes, musicSuggestions, moral, onRegenerate, isRegenerating, characters }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [scriptText, setScriptText] = useState('');
    const [copied, setCopied] = useState(false);
    
    const formatScript = (scenes: Scene[], moral: string): string => {
        const sceneTexts = scenes.map(s => 
          `${t('txtSaveFileScene')} ${s.scene_number}\n${t('txtSaveFileSetting')}: ${s.setting}\n\n${t('txtSaveFileAction')}: ${s.action}\n\n${t('txtSaveFileDialogue')}:\n${s.dialogue}`
        ).join('\n\n---\n\n');
    
        return `${sceneTexts}\n\n---\n\n${t('txtSaveFileMoralHeader').toUpperCase()}:\n${moral}`;
    };

    useEffect(() => {
        setScriptText(formatScript(scenes, moral));
    }, [scenes, moral, t]);

    const handleSave = () => {
        const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cartoon_script.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    return (
        <section>
            <SectionHeader>{t('scriptSectionHeader')}</SectionHeader>
            <div className="bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg border border-[var(--border-color)] shadow-themed relative">
                {isRegenerating && (
                    <div className="absolute inset-0 bg-[var(--bg-secondary)] bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
                        <div className="text-center p-4">
                          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-[var(--accent-primary)] mx-auto"></div>
                          <p className="text-[var(--text-secondary)] text-lg font-medium mt-4">{t('loadingRegeneratingScript')}</p>
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <ToolbarButton onClick={() => setIsEditing(!isEditing)} disabled={isRegenerating} label={isEditing ? t('finishEditingAriaLabel') : t('editScriptAriaLabel')}>
                       {isEditing ? '✅' : '✏️'} <span>{isEditing ? t('saveButton') : t('editButton')}</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={onRegenerate} disabled={isEditing || isRegenerating} label={t('regenerateScriptAriaLabel')}>
                       🔄 <span>{t('regenerateButton')}</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={handleCopy} disabled={isEditing || isRegenerating} label={t('copyScriptAriaLabel')}>
                       📋 <span>{copied ? t('copiedButton') : t('copyButton')}</span>
                    </ToolbarButton>
                    <ToolbarButton onClick={handleSave} disabled={isEditing || isRegenerating} label={t('saveScriptAriaLabel')}>
                       💾 <span>{t('saveAsTxtButton')}</span>
                    </ToolbarButton>
                </div>
                
                {isEditing ? (
                    <textarea 
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        className="w-full h-96 p-4 font-mono text-sm bg-[var(--bg-primary)] border border-[var(--border-color-heavy)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary-dark)]"
                        aria-label={t('scriptEditorAriaLabel')}
                    />
                ) : (
                    <div className="w-full h-96 p-4 font-mono text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] overflow-y-auto whitespace-pre-wrap">
                        {scriptText}
                    </div>
                )}
            </div>

            {musicSuggestions && musicSuggestions.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{t('musicSectionHeader')}</h3>
                    <div className="bg-[var(--bg-secondary)] p-5 rounded-lg border border-[var(--border-color)] shadow-themed">
                        <ul className="space-y-2">
                            {musicSuggestions.map((suggestion, index) => (
                                <li key={index} className="p-3 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)]">
                                    🎵 {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
};