import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { languages } from '../constants/languages';

interface ScriptFormProps {
  script: string;
  setScript: (script: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ScriptForm: React.FC<ScriptFormProps> = ({ script, setScript, language, setLanguage, onSubmit, isLoading }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-6 shadow-themed border border-[var(--border-color)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
              <label htmlFor="language-select-script" className="block text-lg font-medium text-[var(--text-secondary)] mb-2">
                  {t('languageLabel')}:
              </label>
              <select
                  id="language-select-script"
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
              <label htmlFor="cartoon-script" className="block text-lg font-medium text-[var(--text-secondary)] mb-2">
                  {t('pasteYourScriptLabel')}:
              </label>
              <textarea
                  id="cartoon-script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder={t('scriptPlaceholder')}
                  className="w-full h-48 p-3 bg-[var(--bg-primary)] border border-[var(--border-color-heavy)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-primary-dark)] focus:border-[var(--accent-primary-dark)] transition-shadow duration-200 resize-y"
                  disabled={isLoading}
              />
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
            {t('creatingButton')}
          </>
        ) : (
          t('createFromScriptButton')
        )}
      </button>
    </div>
  );
};