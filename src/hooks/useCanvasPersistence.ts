'use client';

import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'last-canvas-state-v1';

export function useCanvasPersistence({
  canvasRef,
  isCanvasReady,
}) {
  const hasRestoredRef = useRef(false);

  // 🔹 RESTORE ON LOAD
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage) return;
    if (hasRestoredRef.current) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      hasRestoredRef.current = true;
      return;
    }

    try {
      const stage = canvasRef.current.stage;
      stage.destroyChildren();

      const restoredStage = window.Konva.Node.create(
        JSON.parse(saved),
        stage.container()
      );

      // Copy restored nodes into existing stage
      restoredStage.getChildren().forEach((child: any) => {
        stage.add(child);
      });

      stage.draw();
      hasRestoredRef.current = true;
    } catch (err) {
      console.error('Failed to restore canvas:', err);
      localStorage.removeItem(STORAGE_KEY);
      hasRestoredRef.current = true;
    }
  }, [isCanvasReady, canvasRef]);

  // 🔹 SAVE
  const saveCanvas = () => {
    if (!canvasRef.current?.stage) return;
    try {
      const json = canvasRef.current.stage.toJSON();
      localStorage.setItem(STORAGE_KEY, json);
    } catch (err) {
      console.error('Failed to save canvas:', err);
    }
  };

  return {
    saveCanvas,
  };
}
