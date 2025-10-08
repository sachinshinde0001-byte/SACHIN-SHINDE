import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { GamificationProvider } from './contexts/GamificationContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <GamificationProvider>
        <App />
      </GamificationProvider>
    </LanguageProvider>
  </React.StrictMode>
);
