
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
    if (typeof window === 'undefined' || typeof window.Konva === 'undefined' || stageRef.current) {
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
  }, [canvasSize, setCanvasReady]);

  useEffect(() => {
    if (!stageRef.current || !isCircular) {
        if(layerRef.current) layerRef.current.clipFunc(null);
    } else {
        const [width, height] = canvasSize.split('x').map(Number);
        const radius = Math.min(width, height) / 2;
        layerRef.current.clipFunc((ctx: any) => {
          ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2, false);
        });
        stageRef.current.draw();
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
    if (stageRef.current) {
      stageRef.current.scale({ x: canvasScale, y: canvasScale });
      stageRef.current.position(canvasPosition);
      stageRef.current.batchDraw();
    }
  }, [canvasScale, canvasPosition]);

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
