
'use client';

import { useCallback, useState } from 'react';

export type CanvasNode = {
  id: string;
  config: any;
};

export type CommandType = 'ADD' | 'DELETE' | 'UPDATE';

export type Command = {
  type: CommandType;
  before?: CanvasNode[];        // for UPDATE or DELETE (previous state)
  after?: CanvasNode[];         // for UPDATE or ADD (new state)
};

const DEFAULT_MAX_HISTORY = 30;

export const useHistory = (maxSize: number = DEFAULT_MAX_HISTORY) => {
  const [history, setHistory] = useState<Command[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  // record a new command (ADD / DELETE / UPDATE)
  const record = useCallback((command: Command) => {
    setHistory(prev => {
      // cut off redo-able future when recording new command
      const base = prev.slice(0, currentStep + 1);
      const updated = [...base, command];
      const final = updated.length > maxSize ? updated.slice(updated.length - maxSize) : updated;

      // set current step to last index of final
      setCurrentStep(final.length - 1);
      return final;
    });
  }, [currentStep, maxSize]);

  // undo: returns the command to be applied by caller (or null)
  const undo = useCallback((): Command | null => {
    if (currentStep < 0) return null;
    const cmd = history[currentStep];
    setCurrentStep(prev => prev - 1);
    return cmd ?? null;
  }, [currentStep, history]);

  // redo: returns the command to be applied by caller (or null)
  const redo = useCallback((): Command | null => {
    if (currentStep >= history.length - 1) return null;
    const next = currentStep + 1;
    const cmd = history[next];
    setCurrentStep(next);
    return cmd ?? null;
  }, [currentStep, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentStep(-1);
  }, []);

  const canUndo = currentStep >= 0;
  const canRedo = currentStep < history.length - 1;

  return {
    history,
    currentStep,
    record,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
  };
};
