
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

        const parentContainer = stage.container().parentElement;
        if (!parentContainer) return;

        let [targetWidth, targetHeight] = size.split('x').map(Number);
        
        // Use clientWidth and clientHeight for available space, minus padding
        const parentStyle = window.getComputedStyle(parentContainer.parentElement!);
        const paddingLeft = parseFloat(parentStyle.paddingLeft);
        const paddingRight = parseFloat(parentStyle.paddingRight);
        const paddingTop = parseFloat(parentStyle.paddingTop);
        const paddingBottom = parseFloat(parentStyle.paddingBottom);

        const availableWidth = parentContainer.parentElement!.clientWidth - paddingLeft - paddingRight;
        const availableHeight = parentContainer.parentElement!.clientHeight - paddingTop - paddingBottom;
        
        const targetRatio = targetWidth / targetHeight;
        const availableRatio = availableWidth / availableHeight;
        
        let newWidth, newHeight;
        
        if (availableRatio > targetRatio) {
            // Available space is wider than target, so height is the constraint
            newHeight = availableHeight;
            newWidth = newHeight * targetRatio;
        } else {
            // Available space is taller than target, so width is the constraint
            newWidth = availableWidth;
            newHeight = newWidth / targetRatio;
        }

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
    
    resizeCanvas(canvasSize); 
    
    const handleResize = () => resizeCanvas(canvasSize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasSize, stage, onReady]);


  return (
    <div className="relative-canvas">
      <div id="canvas-container"></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
