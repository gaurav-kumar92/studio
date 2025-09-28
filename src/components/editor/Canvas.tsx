
'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

// This is a global declaration for the Konva object.
declare global {
  interface Window {
    Konva: any;
  }
}

type CanvasProps = {
  canvasSize: string;
  onReady: () => void;
};

const Canvas = forwardRef<any, CanvasProps>(({ canvasSize, onReady }, ref) => {
  const [stage, setStage] = useState<any>(null);
  const [layer, setLayer] = useState<any>(null);
  const [background, setBackground] = useState<any>(null);

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

    const resizeCanvas = (size: string) => {
      if (!stage) return;

      const PIXELS_PER_POINT = 0.35; // This constant determines the overall scale.

      const [targetWidth, targetHeight] = size.split('x').map(Number);
      
      const newWidth = targetWidth * PIXELS_PER_POINT;
      const newHeight = targetHeight * PIXELS_PER_POINT;

      stage.width(newWidth);
      stage.height(newHeight);
      
      const bgRect = stage.findOne('.background');
      if (bgRect) {
          bgRect.width(newWidth);
          bgRect.height(newHeight);
      }
      
      stage.draw();
    };

    let tempStage = stage;
    if (!tempStage) {
      tempStage = new window.Konva.Stage({
        container: 'canvas-container',
        width: canvasContainer.clientWidth,
        height: canvasContainer.clientHeight,
      });
      setStage(tempStage);

      const newLayer = new window.Konva.Layer();
      tempStage.add(newLayer);
      setLayer(newLayer);

      const newBackground = new window.Konva.Rect({
        x: 0,
        y: 0,
        width: tempStage.width(),
        height: tempStage.height(),
        fill: '#ffffff',
        name: 'background'
      });
      newLayer.add(newBackground);
      setBackground(newBackground);
      
      newLayer.draw();
      onReady();
    }
    
    resizeCanvas(canvasSize); 
    
  }, [canvasSize, stage, onReady]);


  return (
    <div className="relative-canvas">
      <div id="canvas-container"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
