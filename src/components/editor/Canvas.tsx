
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
  const [containerStyle, setContainerStyle] = useState({});

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
  
      const containerWidth = relativeCanvas.clientWidth;
      const containerHeight = relativeCanvas.clientHeight;
  
      // Scale to fit the parent container, with a small margin
      const scale = Math.min(containerWidth / targetWidth, containerHeight / targetHeight) * 0.9;
  
      // Set the base size of the Konva stage to the real pixel size of the design
      stage.width(targetWidth);
      stage.height(targetHeight);
  
      // Resize background to match
      background.width(targetWidth);
      background.height(targetHeight);
  
      // Optional circular clipping for the entire layer
      if (isCircular) {
        const radius = Math.min(targetWidth, targetHeight) / 2;
        layer.clipFunc((ctx: any) => {
          ctx.arc(targetWidth / 2, targetHeight / 2, radius, 0, Math.PI * 2, false);
        });
      } else {
        layer.clipFunc(null);
      }
      
      // Use CSS transform on the container for scaling
      setContainerStyle({
        transform: `scale(${scale})`,
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
      });
      
      // The Konva stage itself is not scaled internally
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 }); // Position is handled by flexbox centering now
  
      stage.draw();
      setInitialScale(scale);
      setCurrentScale(scale);
    };
  
    fitStageIntoParent();
    window.addEventListener('resize', fitStageIntoParent);
  
    return () => window.removeEventListener('resize', fitStageIntoParent);
  }, [canvasSize, isCircular, stage, layer, background, setInitialScale, setCurrentScale]);


  // EFFECT TO HANDLE ZOOM SCALING (CSS Transform Method)
  useEffect(() => {
      const canvasContainer = document.getElementById('canvas-container');
      if (!canvasContainer || !stage) return;
      
      const [targetWidth, targetHeight] = canvasSize.split('x').map(Number);

      setContainerStyle({
          transform: `scale(${currentScale})`,
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
      });

      // Konva stage remains at 1:1 scale internally
      stage.scale({ x: 1, y: 1 });
      stage.draw();

  }, [currentScale, stage, canvasSize]);


  return (
    <div className="relative-canvas">
      <div id="canvas-container" style={containerStyle}></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;

    
