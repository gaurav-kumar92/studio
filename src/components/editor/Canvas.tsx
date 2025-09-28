
'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// This is a global declaration for the Konva object.
declare global {
  interface Window {
    Konva: any;
  }
}

const Canvas = forwardRef((props, ref) => {
  const [stage, setStage] = useState<any>(null);
  const [layer, setLayer] = useState<any>(null);
  const [background, setBackground] = useState<any>(null);
  const [currentCanvasSize, setCurrentCanvasSize] = useState('500x500');

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
    const canvasSizeSelect = document.getElementById('canvas-size') as HTMLSelectElement;

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
          setCurrentCanvasSize(size);
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
      
      resizeCanvas(canvasSizeSelect.value); 
      
      const handleResize = () => resizeCanvas(currentCanvasSize);
      const handleSizeChange = (e: Event) => resizeCanvas((e.target as HTMLSelectElement).value);

      window.addEventListener('resize', handleResize);
      canvasSizeSelect?.addEventListener('change', handleSizeChange);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvasSizeSelect?.removeEventListener('change', handleSizeChange);
        newStage.destroy();
      };

    } catch (error) {
      console.error("CRITICAL KONVA ERROR: Failed to initialize Konva components (stage/layer).", error);
    }
  }, []);

  return (
    <div className="relative-canvas">
      <div id="canvas-container"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
