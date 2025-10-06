'use client';

import { useState, useCallback } from 'react';

const MAX_HISTORY_SIZE = 5;

export const useHistory = () => {
    const [history, setHistory] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(-1);

    const saveState = useCallback((state: string) => {
        setHistory(prev => {
          const trimmed = prev.slice(0, currentStep + 1);
      
          // Don't save if state is identical to the last saved
          if (trimmed.length > 0 && trimmed[trimmed.length - 1] === state) {
            return prev;
          }
      
          const updated = [...trimmed, state].slice(-MAX_HISTORY_SIZE);
          setCurrentStep(updated.length - 1);
          return updated;
        });
      }, [currentStep]);
      
      

    const undo = useCallback(() => {
        if (currentStep > 0) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            return history[newStep];
        }
        return null;
    }, [currentStep, history]);

    const redo = useCallback(() => {
        if (currentStep < history.length - 1) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            return history[newStep];
        }
        return null;
    }, [currentStep, history]);
    
    // Calculate based on current values
    const canUndo = currentStep > 0;
    const canRedo = currentStep < history.length - 1;
    
    return {
        history,
        currentStep,
        saveState,
        undo,
        redo,
        canUndo, 
        canRedo, 
    };
};