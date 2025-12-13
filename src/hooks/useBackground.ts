'use clinet';
//file used for background function like change colour, add image.
import { useState, useCallback, useEffect } from "react";

export function useBackground({ canvasRef, forceRecord, isKonvaReady }) {

    // --- STATE (Same as CanvasContext) ---
  const [backgroundColor, setBackgroundColorState] = useState({
    isGradient: false,
    solidColor: '#ffffff',
    gradientDirection: 'top-to-bottom',
    colorStops: [
      { id: 0, stop: 0, color: '#3b82f6' },
      { id: 1, stop: 1, color: '#a855f7' },
    ],
  });

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageProps, setBackgroundImageProps] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });
// --- SETTERS (Moved exactly from CanvasContext) ---
const setBackgroundColor = (color: any) => {
    setBackgroundColorState(color);
    if (color.solidColor !== 'transparent' || color.isGradient) {
      setBackgroundImage(null);
    }
    forceRecord();
  };
  const handleSetBackgroundImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setBackgroundImage(event.target?.result as string);
          setBackgroundImageProps({ x: 0, y: 0, scale: 1 });
          setBackgroundColorState(prev => ({
            ...prev,
            solidColor: 'transparent',
            isGradient: false
          }));
          forceRecord();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
}, [forceRecord]);

const handleRemoveBackgroundImage = useCallback(() => {
    setBackgroundImage(null);
    setBackgroundColorState(prev => ({ ...prev, solidColor: '#ffffff' }));
    forceRecord();
  }, [forceRecord]);
   // --- BACKGROUND IMAGE CONTROLS (Moved exactly as-is) ---
   const handleBackgroundImageZoom = useCallback((direction: 'in' | 'out') => {
    if (!backgroundImage) return;
    const scaleBy = 1.1;
    const newScale = direction === 'in'
      ? backgroundImageProps.scale * scaleBy
      : backgroundImageProps.scale / scaleBy;

    setBackgroundImageProps(prev => ({ ...prev, scale: newScale }));
    forceRecord?.();
  }, [backgroundImage, backgroundImageProps, forceRecord]);


  const handleBackgroundImagePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!backgroundImage) return;
    const panAmount = 10;

    let newX = backgroundImageProps.x;
    let newY = backgroundImageProps.y;

    switch (direction) {
      case 'up': newY += panAmount; break;
      case 'down': newY -= panAmount; break;
      case 'left': newX += panAmount; break;
      case 'right': newX -= panAmount; break;
    }

    setBackgroundImageProps(prev => ({ ...prev, x: newX, y: newY }));
    forceRecord?.();
  }, [backgroundImage, backgroundImageProps, forceRecord]);

  const handleBackgroundImageReset = useCallback(() => {
    if (!backgroundImage) return;
    setBackgroundImageProps({ x: 0, y: 0, scale: 1 });
    forceRecord?.();
  }, [backgroundImage, forceRecord]);

  // --- BACKGROUND RENDER USE EFFECT (EXACT COPY) ---
  useEffect(() => {
    if (isKonvaReady && canvasRef.current?.background) {
      const backgroundRect = canvasRef.current.background;
      const layer = canvasRef.current.layer;

      backgroundRect.fill(null);
      backgroundRect.fillLinearGradientColorStops(null);
      backgroundRect.fillRadialGradientColorStops(null);
      backgroundRect.fillPatternImage(null);

      if (backgroundImage) {
        // Image is handled in Canvas.tsx
      } else if (backgroundColor.isGradient) {
        const { width, height } = backgroundRect.getClientRect();
        const colorStopsFlat = backgroundColor.colorStops.flatMap(
          (cs: any) => [cs.stop, cs.color]
        );

        if (backgroundColor.gradientDirection === 'radial') {
          backgroundRect.fillPriority('radial-gradient');
          backgroundRect.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
          backgroundRect.fillRadialGradientStartRadius(0);
          backgroundRect.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
          backgroundRect.fillRadialGradientEndRadius(Math.max(width, height) / 2);
          backgroundRect.fillRadialGradientColorStops(colorStopsFlat);
        } else {
          backgroundRect.fillPriority('linear-gradient');
          let start = { x: 0, y: 0 };
          let end = { x: 0, y: 0 };

          switch (backgroundColor.gradientDirection) {
            case 'top-to-bottom': end = { x: 0, y: height }; break;
            case 'left-to-right': end = { x: width, y: 0 }; break;
            case 'diagonal-tl-br': end = { x: width, y: height }; break;
            case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
          }

          backgroundRect.fillLinearGradientStartPoint(start);
          backgroundRect.fillLinearGradientEndPoint(end);
          backgroundRect.fillLinearGradientColorStops(colorStopsFlat);
        }
      } else {
        backgroundRect.fillPriority('color');
        backgroundRect.fill(backgroundColor.solidColor);
      }

      if (layer) layer.draw();
    }
  }, [backgroundColor, isKonvaReady, backgroundImage]);
  return {
    backgroundColor,
    setBackgroundColor,
    backgroundImage,
    setBackgroundImage,
    backgroundImageProps,
    handleSetBackgroundImage,
    handleBackgroundImageZoom,
    handleBackgroundImagePan,
    handleBackgroundImageReset,
    handleRemoveBackgroundImage,
  };

}