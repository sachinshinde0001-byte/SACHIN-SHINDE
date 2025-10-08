import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="text-center p-8 flex flex-col items-center justify-center space-y-4 mt-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[var(--accent-primary)]"></div>
      <p className="text-[var(--text-secondary)] text-lg font-medium">{message || 'Processing your idea...'}</p>
    </div>
  );
};