
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
        draggable: false, 
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
  
      // Reset any external scaling on the container
      canvasContainer.style.transform = '';
      
      const containerWidth = relativeCanvas.clientWidth;
      const containerHeight = relativeCanvas.clientHeight;
  
      // Scale to fit the parent container
      const scale = Math.min((containerWidth / targetWidth) * 0.95, (containerHeight / targetHeight) * 0.95);
  
      // Apply scaling and centering via Konva itself
      stage.width(targetWidth);
      stage.height(targetHeight);
      stage.scale({ x: scale, y: scale });

      const stageCenter = { x: targetWidth / 2, y: targetHeight / 2 };
      
      stage.position({
        x: (containerWidth - targetWidth * scale) / 2,
        y: (containerHeight - targetHeight * scale) / 2
      });
  
      // Resize background
      background.width(targetWidth);
      background.height(targetHeight);
  
      // Optional circular clipping
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
    window.addEventListener('resize', fitStageIntoParent);
  
    return () => window.removeEventListener('resize', fitStageIntoParent);
  }, [canvasSize, isCircular, stage, layer, background, setInitialScale, setCurrentScale]);

  // EFFECT TO HANDLE ZOOM SCALING (Proper Konva Method)
  useEffect(() => {
    if (!stage) return;

    const [targetWidth, targetHeight] = canvasSize.split('x').map(Number);

    // Find the center of the stage
    const stageCenter = {
      x: targetWidth / 2,
      y: targetHeight / 2,
    };

    // Calculate new scale
    const scale = currentScale;

    // Apply scale (both x and y)
    stage.scale({ x: scale, y: scale });

    // Keep canvas centered by adjusting position
    const canvasContainer = document.getElementById('canvas-container');
    const parent = canvasContainer?.parentElement;
    if (!parent) return;

    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    // Compute new position so the stage stays centered
    stage.position({
      x: parentWidth / 2 - stageCenter.x * scale,
      y: parentHeight / 2 - stageCenter.y * scale,
    });

    stage.batchDraw();
  }, [currentScale, stage, canvasSize]);


  return (
    <div className="relative-canvas">
      <div id="canvas-container"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;

    