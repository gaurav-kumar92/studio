
'use client';

import { useState, useCallback } from 'react';

const MAX_HISTORY_SIZE = 30;

export type Command = {
    type: 'ADD' | 'DELETE' | 'UPDATE';
    targets: { id: string, config: any }[];
    before?: { id: string, config: any }[];
    after?: { id: string, config: any }[];
};

export const useHistory = () => {
    const [history, setHistory] = useState<Command[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(-1);

    const record = useCallback((command: Omit<Command, 'before' | 'after'>) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, currentStep + 1);
            
            const fullCommand: Command = {
                ...command,
                before: command.type === 'UPDATE' ? [] : undefined,
                after: command.type === 'UPDATE' ? [] : undefined,
            };

            const updated = [...newHistory, fullCommand];
            const final = updated.length > MAX_HISTORY_SIZE ? updated.slice(updated.length - MAX_HISTORY_SIZE) : updated;
            
            setCurrentStep(final.length - 1);
            return final;
        });
    }, [currentStep]);

    const undo = useCallback(() => {
        if (currentStep < 0) return null;

        const command = history[currentStep];
        setCurrentStep(prev => prev - 1);
        return command;
    }, [currentStep, history]);

    const redo = useCallback(() => {
        if (currentStep < history.length - 1) {
            const newStep = currentStep + 1;
            const command = history[newStep];
            setCurrentStep(newStep);
            return command;
        }
        return null;
    }, [currentStep, history]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        setCurrentStep(-1);
    }, []);

    const canUndo = currentStep >= 0;
    const canRedo = currentStep < history.length - 1;

    return {
        record,
        undo,
        redo,
        canUndo,
        canRedo,
        clearHistory,
    };
};
