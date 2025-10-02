
'use client';

import { useState, useCallback } from 'react';

export const useHistory = () => {
    const [history, setHistory] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(-1);

    const saveState = useCallback((state: string) => {
        const newHistory = history.slice(0, currentStep + 1);
        newHistory.push(state);
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
    }, [history, currentStep]);

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

    return {
        history,
        currentStep,
        saveState,
        undo,
        redo
    };
};
