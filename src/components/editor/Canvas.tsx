
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

    // If stage doesn't exist, create it.
    let tempStage = stage;
    if (!tempStage) {
      const parentContainer = canvasContainer.parentElement as HTMLElement;
      tempStage = new window.Konva.Stage({
        container: 'canvas-container',
        width: parentContainer.clientWidth,
        height: parentContainer.clientHeight,
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
    
    const resizeCanvas = (size: string) => {
        if (!tempStage) return;

        const parentContainer = tempStage.container().parentElement;
        if (!parentContainer) return;

        let [targetWidth, targetHeight] = size.split('x').map(Number);
        
        const parentWidth = parentContainer.clientWidth;
        const parentHeight = parentContainer.clientHeight;
        
        const targetRatio = targetWidth / targetHeight;
        const parentRatio = parentWidth / parentHeight;
        
        let newWidth, newHeight;
        
        if (parentRatio > targetRatio) {
            newHeight = parentHeight;
            newWidth = parentHeight * targetRatio;
        } else {
            newWidth = parentWidth;
            newHeight = parentWidth / targetRatio;
        }

        tempStage.width(newWidth);
        tempStage.height(newHeight);
        
        const bgRect = tempStage.findOne('.background');
        if (bgRect) {
            bgRect.width(newWidth);
            bgRect.height(newHeight);
        }
        
        tempStage.draw();
    };
    
    resizeCanvas(canvasSize); 
    
    const handleResize = () => resizeCanvas(canvasSize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (stage && !canvasContainer.isConnected) {
        stage.destroy();
      }
    };
  }, [canvasSize]);


  return (
    <div className="relative-canvas">
      <div id="canvas-container"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
