
'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';

// This is a global declaration for the Konva object.
declare global {
  interface Window {
    Konva: any;
  }
}

type CanvasProps = {
  canvasSize: string;
  isCircular: boolean;
};

const Canvas = forwardRef<any, CanvasProps>(({ canvasSize, isCircular }, ref) => {
  const [stage, setStage] = useState<any>(null);
  const [layer, setLayer] = useState<any>(null);
  const [background, setBackground] = useState<any>(null);
  const { setInitialScale, setCanvasReady, setCurrentScale, currentScale } = useCanvas();

  // Expose stage, layer, and background to the parent component
  useImperativeHandle(ref, () => ({
    stage,
    layer,
    background,
  }));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.Konva === 'undefined') {
      return;
    }

    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
      return;
    }

    // Ensure we don't re-initialize
    if (!stage) {
      const [targetWidth, targetHeight] = canvasSize.split('x').map(Number);
      
      let tempStage = new window.Konva.Stage({
        container: 'canvas-container',
        width: targetWidth,
        height: targetHeight,
        draggable: false, // Draggable is now controlled by spacebar
      });
      setStage(tempStage);

      const newLayer = new window.Konva.Layer();
      tempStage.add(newLayer);
      setLayer(newLayer);

      const newBackground = new window.Konva.Rect({
        x: 0,
        y: 0,
        width: targetWidth,
        height: targetHeight,
        fill: '#ffffff',
        name: 'background',
        listening: false,
      });
      newLayer.add(newBackground);
      setBackground(newBackground);

      newLayer.draw();
      setCanvasReady(true);
    }
  }, [stage, setCanvasReady, canvasSize]);

  useEffect(() => {
    if (!stage || !layer || !background) return;

    const canvasContainer = document.getElementById('canvas-container');
    const relativeCanvas = canvasContainer?.parentElement;
    if (!canvasContainer || !relativeCanvas) return;

    const fitStageIntoParent = () => {
      const [targetWidth, targetHeight] = canvasSize.split('x').map(Number);

      const containerWidth = relativeCanvas.clientWidth;
      const containerHeight = relativeCanvas.clientHeight;
      
      const scale = Math.min(
        (containerWidth / targetWidth) * 0.95, 
        (containerHeight / targetHeight) * 0.95
      );
      
      stage.width(targetWidth);
      stage.height(targetHeight);
      
      canvasContainer.style.transform = `scale(${scale})`;
      canvasContainer.style.width = `${targetWidth}px`;
      canvasContainer.style.height = `${targetHeight}px`;
      
      background.width(targetWidth);
      background.height(targetHeight);
      
      if (isCircular) {
        const radius = Math.min(targetWidth, targetHeight) / 2;
        layer.clipFunc((ctx: any) => {
          ctx.arc(targetWidth / 2, targetHeight / 2, radius, 0, Math.PI * 2, false);
        });
      } else {
        layer.clipFunc(null);
      }
      
      stage.draw();
      
      setInitialScale(scale);
      setCurrentScale(scale);
    };

    fitStageIntoParent();
    
    // We only want this to run when the canvas size or circular state changes.
  }, [canvasSize, isCircular, stage, layer, background, setInitialScale, setCurrentScale]);

  // EFFECT TO HANDLE ZOOM SCALING AND SCROLLING
  useEffect(() => {
    if (!stage) return;
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;

    const [targetWidth, targetHeight] = canvasSize.split('x').map(Number);

    // Apply scale transform
    canvasContainer.style.transform = `scale(${currentScale})`;
    
    // Update container dimensions to trigger scrollbar recalculation
    canvasContainer.style.width = `${targetWidth}px`;
    canvasContainer.style.height = `${targetHeight}px`;

  }, [currentScale, stage, canvasSize]);


  return (
    <div className="relative-canvas">
      <div id="canvas-container"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
