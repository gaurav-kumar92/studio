
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
    // 3. Get the parent container
    const relativeCanvas = canvasContainer.parentElement; 
    if (!relativeCanvas) return;
    
    let tempStage = stage;
    if (!tempStage) {
      tempStage = new window.Konva.Stage({
        container: 'canvas-container',
        width: 0,
        height: 0,
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
        name: 'background'
      });
      newLayer.add(newBackground);
      setBackground(newBackground);

      // 4. Calculate and set initial scale
      const containerWidth = relativeCanvas.clientWidth;
      const containerHeight = relativeCanvas.clientHeight;
      const stageWidth = tempStage.width();
      const stageHeight = tempStage.height();
      
      if (stageWidth > 0 && stageHeight > 0) {
        const scale = Math.min(containerWidth / stageWidth, containerHeight / stageHeight);
        tempStage.scale({ x: scale, y: scale });
        setInitialScale(scale); // Set it in the context
      }
  
      newLayer.draw();
      onReady();
    }
    
  }, [stage, onReady, setInitialScale]);

  useEffect(() => {
    if (!stage || !layer) return;

    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
      return;
    }
    const relativeCanvas = canvasContainer.parentElement; 
    if (!relativeCanvas) return;

    const PIXELS_PER_POINT = 0.35; // This constant intentionally scales down print sizes to fit on screen.

    const [targetWidth, targetHeight] = canvasSize.split('x').map(Number);
    
    const newWidth = targetWidth * PIXELS_PER_POINT;
    const newHeight = targetHeight * PIXELS_PER_POINT;

    // Resize Konva Stage
    stage.width(newWidth);
    stage.height(newHeight);
    
    // Resize Konva Background Rect
    const bgRect = stage.findOne('.background');
    if (bgRect) {
        bgRect.width(newWidth);
        bgRect.height(newHeight);
    }
    
    // Resize the container div to match the stage
    canvasContainer.style.width = `${newWidth}px`;
    canvasContainer.style.height = `${newHeight}px`;

    // Apply or remove circular clipping
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

  }, [canvasSize, isCircular, stage, layer]);


  return (
    <div className="relative-canvas">
      <div id="canvas-container" style={{overflow: 'hidden'}}></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
