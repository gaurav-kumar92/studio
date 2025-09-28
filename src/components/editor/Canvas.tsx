
'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// This is a global declaration for the Konva object.
declare global {
  interface Window {
    Konva: any;
  }
}

type CanvasProps = {
  canvasSize: string;
};

const Canvas = forwardRef<any, CanvasProps>(({ canvasSize }, ref) => {
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

    try {
      const parentContainer = canvasContainer.parentElement as HTMLElement;
      
      const newStage = new window.Konva.Stage({
        container: 'canvas-container',
        width: parentContainer.clientWidth,
        height: parentContainer.clientHeight,
      });
      
      const newLayer = new window.Konva.Layer();
      newStage.add(newLayer);

      const newBackground = new window.Konva.Rect({
        x: 0,
        y: 0,
        width: newStage.width(),
        height: newStage.height(),
        fill: '#ffffff',
        name: 'background'
      });
      newLayer.add(newBackground);
      newLayer.draw();

      setStage(newStage);
      setLayer(newLayer);
      setBackground(newBackground);
      
      const resizeCanvas = (size: string) => {
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

          newStage.width(newWidth);
          newStage.height(newHeight);
          newBackground.width(newWidth);
          newBackground.height(newHeight);
          newStage.draw();
      };
      
      resizeCanvas(canvasSize); 
      
      const handleResize = () => resizeCanvas(canvasSize);

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if(newStage) {
          newStage.destroy();
        }
      };

    } catch (error) {
      console.error("CRITICAL KONVA ERROR: Failed to initialize Konva components (stage/layer).", error);
    }
  }, []);

  useEffect(() => {
    if(!stage) return;
    const parentContainer = stage.container().parentElement;

    const resizeCanvas = (size: string) => {
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

        stage.width(newWidth);
        stage.height(newHeight);
        background.width(newWidth);
        background.height(newHeight);
        stage.draw();
    };

    resizeCanvas(canvasSize);

    const handleResize = () => resizeCanvas(canvasSize);
    window.addEventListener('resize', handleResize);

    return () => {
       window.removeEventListener('resize', handleResize);
    }
  }, [canvasSize, stage, background]);

  return (
    <div className="relative-canvas">
      <div id="canvas-container"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
