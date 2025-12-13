'use client';

import { useState, useCallback, useEffect } from "react";

export function useZoomPan({ canvasRef, isCanvasReady }) {
  
    const [canvasScale, setCanvasScale] = useState(1);
    const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);

    const fitToScreen = useCallback(() => {
        if (!canvasRef.current?.stage) return;
        const stage = canvasRef.current.stage;
        const container = document.getElementById('canvas-wrapper');
        if (!container) return;
      
        const padding = 30;
        const containerWidth = container.clientWidth - padding;
        const containerHeight = container.clientHeight - padding;
      
        const scale = Math.min(containerWidth / stage.width(), containerHeight / stage.height());
      
        setCanvasScale(scale);
      
        const newX = (container.clientWidth - stage.width() * scale) / 2;
        const newY = (container.clientHeight - stage.height() * scale) / 2;
      
        setCanvasPosition({ x: newX, y: newY });
      }, [canvasRef]);
      const zoom = useCallback(
        (direction: 'in' | 'out', pointerPos?: { x: number; y: number }) => {
          if (!canvasRef.current?.stage) return;
          const stage = canvasRef.current.stage;
          const container = document.getElementById('canvas-wrapper');
          if (!container) return;
      
          const scaleBy = 1.1;
          const oldScale = canvasScale;
      
          let newScale;
          if (direction === 'in') {
            newScale = oldScale * scaleBy;
          } else {
            const padding = 30;
            const containerWidth = container.clientWidth - padding;
            const containerHeight = container.clientHeight - padding;
            const minScale = Math.min(containerWidth / stage.width(), containerHeight / stage.height());
            newScale = Math.max(oldScale / scaleBy, minScale);
          }
      
          const pointer = pointerPos || {
            x: container.clientWidth / 2,
            y: container.clientHeight / 2,
          };
      
          const mousePointTo = {
            x: (pointer.x - canvasPosition.x) / oldScale,
            y: (pointer.y - canvasPosition.y) / oldScale,
          };
      
          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };
      
          setCanvasScale(newScale);
          setCanvasPosition(newPos);
        },
        [canvasScale, canvasPosition, canvasRef]
      );
      const zoomIn = useCallback(() => zoom('in'), [zoom]);
      const zoomOut = useCallback(() => zoom('out'), [zoom]);
      const handleZoomChange = useCallback(
        (value: string) => {
          if (value === "auto") {
            fitToScreen();
          } else {
            const newScale = parseFloat(value);
            setCanvasScale(newScale);
          }
        },
        [fitToScreen]
      );
      useEffect(() => {
        const container = document.getElementById("canvas-wrapper");
        const stage = canvasRef.current?.stage;
        if (!container || !stage || !isCanvasReady) return;
      
        const getStagePointerFromTouch = (touch:  Touch | undefined) => {
            if (!touch) return null;
            const rect = container.getBoundingClientRect();
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
              };
            };
      
            const onTouchStart = (e: TouchEvent) => {
                if (!e.touches || e.touches.length === 0) return;
                const touch = e.touches[0];
                const pointer = getStagePointerFromTouch(touch);
                if (!pointer) return;
                const konvaTarget = stage.getIntersection(pointer);
  
                if (konvaTarget && konvaTarget !== stage && (konvaTarget.name && konvaTarget.name() !== 'background')) {
                  setIsPanning(false);
                  setLastTouch(null);
                  return;
                }
      
                setIsPanning(true);
                setLastTouch({ x: touch.clientX, y: touch.clientY });
              };

              const onTouchMove = (e: TouchEvent) => {
                if (!isPanning || !lastTouch || !e.touches || !e.touches.length) return;
                const touch = e.touches[0];
            
                e.preventDefault();
                const dx = touch.clientX - lastTouch.x;
      const dy = touch.clientY - lastTouch.y;
  
      const stageWidth = stage.width() * canvasScale;
      const stageHeight = stage.height() * canvasScale;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      setCanvasPosition((prev) => {
        let newX = prev.x + dx;
        let newY = prev.y + dy;
  
        const minX = containerWidth - stageWidth;
        const minY = containerHeight - stageHeight;
  
        if (stageWidth <= containerWidth) {
          newX = Math.round((containerWidth - stageWidth) / 2);
        } else {
          newX = Math.min(0, Math.max(newX, minX));
        }
        if (stageHeight <= containerHeight) {
            newY = Math.round((containerHeight - stageHeight) / 2);
          } else {
            newY = Math.min(0, Math.max(newY, minY));
          }
    
          return { x: newX, y: newY };
        });
        setLastTouch({ x: touch.clientX, y: touch.clientY });
    };
      
        const onTouchEnd = () => {
          setIsPanning(false);
          setLastTouch(null);
        };
      
        container.addEventListener("touchstart", onTouchStart, { passive: true });
        container.addEventListener("touchmove", onTouchMove, { passive: false });
        container.addEventListener("touchend", onTouchEnd);
        container.addEventListener('touchcancel', onTouchEnd);
      
        return () => {
          container.removeEventListener("touchstart", onTouchStart);
          container.removeEventListener("touchmove", onTouchMove);
          container.removeEventListener("touchend", onTouchEnd);
          container.removeEventListener('touchcancel', onTouchEnd);
        };
      }, [isCanvasReady, canvasScale, canvasRef]);
      return {
        canvasScale,
        canvasPosition,
        setCanvasPosition,
        zoomIn,
        zoomOut,
        zoom,
        fitToScreen,
        handleZoomChange,
      };
    }
