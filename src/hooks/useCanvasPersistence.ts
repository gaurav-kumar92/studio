
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { loadProjectLocal, saveProjectLocal } from '@/lib/db';
import { useHistory } from './useHistory';

const PROJECT_ID = 'default-project';

// --- Serialization / Hydration ---
function serializeCanvas(stage: any) {
  if (!stage || typeof window === 'undefined') return null;
  return stage.toJSON();
}

function loadCanvas(stage: any, json: string) {
  if (!stage || !json || typeof window === 'undefined' || !window.Konva) return null;
  const container = stage.container();
  stage.destroy();
  const newStage = window.Konva.Node.create(json, container);
  return newStage;
}

// --- Main Hook ---
export function useCanvasPersistence({
  canvasRef,
  isCanvasReady,
  setKonvaObjects,
  attachDoubleClick,
  setSelectedNodes,
}: {
  canvasRef: React.RefObject<any>;
  isCanvasReady: boolean;
  setKonvaObjects: (nodes: any[]) => void;
  attachDoubleClick: (node: any) => void;
  setSelectedNodes: (nodes: any[]) => void;
}) {
  const { record, undo, redo, canUndo, canRedo } = useHistory<string>();
  const isRestoringRef = useRef(false);

  // --- Save Logic ---
  const save = useCallback(() => {
    if (isRestoringRef.current || !canvasRef.current?.stage || typeof window === 'undefined') return;
    const json = serializeCanvas(canvasRef.current.stage);
    if (json) {
      saveProjectLocal(PROJECT_ID, json);
    }
  }, [canvasRef]);

  // --- Record to History (for Undo/Redo) ---
  const forceRecord = useCallback(() => {
    if (isRestoringRef.current || !canvasRef.current?.stage || typeof window === 'undefined') return;
    const json = serializeCanvas(canvasRef.current.stage);
    if (json) {
      record(json);
    }
  }, [canvasRef, record]);

  // --- Undo/Redo Implementation ---
  const applyHistory = useCallback((jsonState: string | null) => {
    if (!jsonState || !canvasRef.current?.stage || typeof window === 'undefined' || !window.Konva) return;

    isRestoringRef.current = true;
    try {
      const newStage = loadCanvas(canvasRef.current.stage, jsonState);
      if (newStage) {
        (canvasRef.current as any).stage = newStage;
        const layer = newStage.findOne('Layer') || newStage.getChildren()[0];
        
        if (layer) {
          (canvasRef.current as any).layer = layer;
          (canvasRef.current as any).background = layer.findOne('.background') || layer.findOne('Rect');
          
          // Re-attach event handlers to all nodes
          layer.find('*').forEach((node: any) => {
            const className = node.getClassName();
            if (node.name() !== 'background' && className !== 'Transformer' && node.id()) {
               attachDoubleClick(node);
            }
          });
          
          const filteredChildren = Array.from(layer.getChildren()).filter((n: any) => {
            const className = n.getClassName();
            return n.id() && n.name() !== 'background' && className !== 'Transformer';
          });
          
          setKonvaObjects(filteredChildren);
        }
        setSelectedNodes([]);
      }
    } catch (err) {
      console.error("Error applying history state:", err);
    } finally {
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 50);
    }

  }, [canvasRef, attachDoubleClick, setKonvaObjects, setSelectedNodes]);

  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState !== null) {
      applyHistory(prevState);
    }
  }, [undo, applyHistory]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState !== null) {
      applyHistory(nextState);
    }
  }, [redo, applyHistory]);


  // --- Event Listeners ---
  useEffect(() => {
    // Save on drag/transform end
    if (isCanvasReady && canvasRef.current?.stage) {
      const stage = canvasRef.current.stage;
      stage.on('dragend transformend', forceRecord);

      return () => {
        stage.off('dragend transformend', forceRecord);
      };
    }
  }, [isCanvasReady, canvasRef, forceRecord]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Save on tab close / visibility change
    const handleSave = () => save();
    window.addEventListener('beforeunload', handleSave);
    
    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [save]);

  // --- Initial Load ---
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current || typeof window === 'undefined') return;

    async function load() {
      try {
        const project = await loadProjectLocal(PROJECT_ID);
        if (project?.state) {
          applyHistory(project.state);
          forceRecord(); // Record initial state for undo
        }
      } catch (err) {
        console.error("Failed to load project from local DB", err);
      }
    }
    load();
  }, [isCanvasReady, canvasRef, applyHistory, forceRecord]);
  

  return {
    save,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
    forceRecord,
  };
}
