
'use client';

import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
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
  backgroundImage: any;
};

const Canvas = forwardRef<any, CanvasProps>(({ canvasSize, isCircular, backgroundImage }, ref) => {
  const { 
    setCanvasReady, 
    fitToScreen, 
    canvasScale,
    canvasPosition, 
    backgroundImageProps,
  } = useCanvas();

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const backgroundRef = useRef<any>(null);
  
  useImperativeHandle(ref, () => ({
    stage: stageRef.current,
    layer: layerRef.current,
    background: backgroundRef.current,
  }));

  useEffect(() => {
    // Only run this once when Konva is available.
    if (typeof window === 'undefined' || !window.Konva || stageRef.current) {
      return;
    }

    const [width, height] = canvasSize.split('x').map(Number);

    const stage = new window.Konva.Stage({
      container: 'canvas-container',
      width: width,
      height: height,
      draggable: false, // We handle dragging manually for smoother touch control
    });
    stageRef.current = stage;

    const layer = new window.Konva.Layer();
    stage.add(layer);
    layerRef.current = layer;

    const background = new window.Konva.Rect({
      x: 0, y: 0,
      width: width, height: height,
      fill: '#ffffff',
      name: 'background',
      listening: false,
    });
    layer.add(background);
    backgroundRef.current = background;

    setCanvasReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize, setCanvasReady]);

  useEffect(() => {
    if (!stageRef.current) return;

    if (isCircular) {
        const [width, height] = canvasSize.split('x').map(Number);
        const radius = Math.min(width, height) / 2;
        layerRef.current.clipFunc((ctx: any) => {
          ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2, false);
        });
        stageRef.current.draw();
    } else {
        if(layerRef.current) {
          layerRef.current.clipFunc(null);
          stageRef.current.draw();
        }
    }
  }, [isCircular, canvasSize]);

  useEffect(() => {
    if (stageRef.current) {
      const [width, height] = canvasSize.split('x').map(Number);
      stageRef.current.width(width);
      stageRef.current.height(height);
      if(backgroundRef.current) {
        backgroundRef.current.width(width);
        backgroundRef.current.height(height);
      }
      fitToScreen();
    }
  }, [canvasSize, fitToScreen]);
  
  useEffect(() => {
      if (backgroundRef.current) {
          if (backgroundImage) {
              const img = new Image();
              img.src = backgroundImage;
              img.onload = () => {
                  backgroundRef.current.fillPatternImage(img);
                  backgroundRef.current.fillPatternRepeat('no-repeat');
                  
                  const bgWidth = backgroundRef.current.width();
                  const bgHeight = backgroundRef.current.height();
                  
                  const imgScale = Math.max(bgWidth / img.width, bgHeight / img.height);
                  
                  backgroundRef.current.fillPatternScale({ 
                      x: imgScale * backgroundImageProps.scale, 
                      y: imgScale * backgroundImageProps.scale,
                  });
                  backgroundRef.current.fillPatternOffset({
                      x: backgroundImageProps.x,
                      y: backgroundImageProps.y,
                  });

                  backgroundRef.current.fill(null);
                  backgroundRef.current.fillLinearGradientColorStops(null);
                  backgroundRef.current.fillRadialGradientColorStops(null);
                  layerRef.current?.draw();
              };
          }
      }
  }, [backgroundImage, backgroundImageProps]);

  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.x(canvasPosition.x);
      stageRef.current.y(canvasPosition.y);
      stageRef.current.scale({ x: canvasScale, y: canvasScale });
      stageRef.current.batchDraw();
    }
  }, [canvasPosition, canvasScale]);


  return (
    <div className="relative-canvas" id="canvas-wrapper">
      <div id="canvas-container" style={{
         transformOrigin: '0 0', // Ensure this is set
      }}></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
