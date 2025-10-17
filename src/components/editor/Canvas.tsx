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
  onReady: () => void;
};

const Canvas = forwardRef<any, CanvasProps>(({ canvasSize, isCircular, onReady }, ref) => {
  const [stage, setStage] = useState<any>(null);
  const [layer, setLayer] = useState<any>(null);
  const [background, setBackground] = useState<any>(null);
  const { setInitialScale } = useCanvas();

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

    let tempStage = stage;
    if (!tempStage) {
      tempStage = new window.Konva.Stage({
        container: 'canvas-container',
        width: 0,
        height: 0,
        draggable: false, 
      });
      setStage(tempStage);

      const newLayer = new window.Konva.Layer();
      tempStage.add(newLayer);
      setLayer(newLayer);

      const newBackground = new window.Konva.Rect({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fill: '#ffffff',
        name: 'background',
        listening: false,
      });
      newLayer.add(newBackground);
      setBackground(newBackground);
  
      newLayer.draw();
      onReady();
    }
    
  }, [stage, onReady]);

  useEffect(() => {
    if (!stage || !layer || !background) return;

    const canvasContainer = document.getElementById('canvas-container');
    const relativeCanvas = canvasContainer?.parentElement;
    if (!canvasContainer || !relativeCanvas) return;

    const fitStageIntoParent = () => {
      const [targetWidth, targetHeight] = canvasSize.split('x').map(Number);
      
      const containerWidth = relativeCanvas.clientWidth;
      const containerHeight = relativeCanvas.clientHeight;
      
      const scale = Math.min(containerWidth / targetWidth, containerHeight / targetHeight);

      const newWidth = targetWidth * scale;
      const newHeight = targetHeight * scale;

      stage.width(newWidth);
      stage.height(newHeight);
      
      background.width(newWidth);
      background.height(newHeight);

      canvasContainer.style.width = `${newWidth}px`;
      canvasContainer.style.height = `${newHeight}px`;

      if (isCircular) {
        canvasContainer.style.borderRadius = '50%';
        const radius = Math.min(newWidth, newHeight) / 2;
        layer.clipFunc((ctx: any) => {
          ctx.arc(newWidth / 2, newHeight / 2, radius, 0, Math.PI * 2, false);
        });
      } else {
        canvasContainer.style.borderRadius = '0';
        layer.clipFunc(null);
      }

      stage.draw();
      setInitialScale(scale);
    }

    fitStageIntoParent();

    window.addEventListener('resize', fitStageIntoParent);
    return () => {
      window.removeEventListener('resize', fitStageIntoParent);
    }

  }, [canvasSize, isCircular, stage, layer, background, setInitialScale]);


  return (
    <div className="relative-canvas" style={{ display: 'grid' }}>
      <div id="canvas-container"style={{
      margin: 'auto',
    }}></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
