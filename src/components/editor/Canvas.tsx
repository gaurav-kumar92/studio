
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
};

const Canvas = forwardRef<any, CanvasProps>(({ canvasSize, isCircular }, ref) => {
  const { 
    setCanvasReady, 
    fitToScreen, 
    canvasPosition, 
    setCanvasPosition,
    canvasScale 
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
    // Only run this once when Konva is available. The `stageRef.current` check was wrong.
    if (typeof window === 'undefined' || !window.Konva || stageRef.current) {
      return;
    }

    const [width, height] = canvasSize.split('x').map(Number);

    const stage = new window.Konva.Stage({
      container: 'canvas-container',
      width: width,
      height: height,
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
    const stage = stageRef.current;
    if (stage) {
      const container = document.getElementById('canvas-wrapper');
      if (!container) return;

      const newPos = {
        x: (container.clientWidth - stage.width() * canvasScale) / 2,
        y: (container.clientHeight - stage.height() * canvasScale) / 2,
      };

      stage.scale({ x: canvasScale, y: canvasScale });
      stage.position(newPos);
      stage.batchDraw();
    }
  }, [canvasScale]);


  return (
    <div className="relative-canvas" id="canvas-wrapper">
      <div id="canvas-container" style={{
         boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
