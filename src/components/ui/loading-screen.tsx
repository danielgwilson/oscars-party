import React from 'react';
import { Spinner } from './spinner';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
      <div className="text-center p-6 rounded-lg bg-black/50 border border-amber-600 shadow-lg">
        <Spinner size="xl" color="accent" className="mb-4 mx-auto" />
        <p className="text-amber-200 text-lg">{message}</p>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  visible: boolean;
}

export function LoadingOverlay({ message = 'Loading...', visible }: LoadingOverlayProps) {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="text-center p-6 rounded-lg bg-black/50 border border-amber-600 shadow-lg">
        <Spinner size="xl" color="accent" className="mb-4 mx-auto" />
        <p className="text-amber-200 text-lg">{message}</p>
      </div>
    </div>
  );
}