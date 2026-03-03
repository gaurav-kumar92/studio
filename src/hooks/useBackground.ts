'use client';

import { useState, useEffect, useCallback } from 'react';

export const useBackground = ({ 
  canvasRef, 
  forceRecord, 
  isKonvaReady 
}: { 
  canvasRef: React.RefObject<any>, 
  forceRecord: () => void,
  isKonvaReady: boolean
}) => {
  const [backgroundColorState, setBackgroundColorState] = useState({
    isGradient: false,
    isTransparent: false,
    solidColor: '#ffffff',
    colorStops: [
      { stop: 0, color: '#3b82f6' },
      { stop: 1, color: '#a855f7' },
    ],
    gradientDirection: 'top-to-bottom',
  });

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageProps, setBackgroundImageProps] = useState({
    x: 0,
    y: 0,
    scale: 1,
  });

  const setBackgroundColor = (color: any) => {
    const nextState = { ...backgroundColorState, ...color };
  
    const transparencyToggledOn =
      !backgroundColorState.isTransparent && nextState.isTransparent;
  
    const transparencyToggledOff =
      backgroundColorState.isTransparent && !nextState.isTransparent;
  
    if (transparencyToggledOn) {
      nextState.solidColor = 'transparent';
      nextState.isGradient = false;
    }
  
    if (transparencyToggledOff) {
      nextState.solidColor = '#ffffff'; 
      nextState.isGradient = false;
    }
  
    setBackgroundColorState(nextState);
    setBackgroundImage(null);
    forceRecord?.();
  };
  
  const handleSetBackgroundImage = useCallback(() => {
    if (typeof window === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setBackgroundImage(reader.result as string);
                setBackgroundColorState(prev => ({ ...prev, solidColor: 'transparent', isGradient: false, isTransparent: true }));
                forceRecord?.();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
  }, [forceRecord]);

  const handleBackgroundImageZoom = (direction: 'in' | 'out') => {
    const zoom = direction === 'in' ? 1.1 : 0.9;
    setBackgroundImageProps(prev => ({ ...prev, scale: prev.scale * zoom }));
  };

  const handleBackgroundImagePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const panAmount = 10;
    const pan = { x: 0, y: 0 };
    if (direction === 'up') pan.y = -panAmount;
    if (direction === 'down') pan.y = panAmount;
    if (direction === 'left') pan.x = -panAmount;
    if (direction === 'right') pan.x = panAmount;
    
    setBackgroundImageProps(prev => ({ ...prev, x: prev.x + pan.x, y: prev.y + pan.y }));
  };

  const handleBackgroundImageReset = () => {
    setBackgroundImageProps({ x: 0, y: 0, scale: 1 });
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImage(null);
    setBackgroundColorState(prev => ({ ...prev, solidColor: '#ffffff', isGradient: false, isTransparent: false }));
    forceRecord?.();
  };

  const drawBackground = useCallback(() => {
    if (!canvasRef.current || !isKonvaReady || typeof window === 'undefined' || !window.Konva) return;
  
    const stage = canvasRef.current.stage;
    if (!stage) return;

    let backgroundRect = canvasRef.current.background;
    if (!backgroundRect) return;
  
    const width = stage.width();
    const height = stage.height();
  
    backgroundRect.width(width);
    backgroundRect.height(height);
  
    backgroundRect.fill(null);
    backgroundRect.fillLinearGradientColorStops(null);
    backgroundRect.fillRadialGradientColorStops(null);
    backgroundRect.fillPatternImage(null);
  
    if (backgroundColorState.isTransparent && !backgroundImage) {
      backgroundRect.fill('transparent');
    } else if (backgroundImage) {
      // Handled by fillPatternImage logic in Canvas.tsx or similar
    } else if (backgroundColorState.isGradient) {
      const colorStopsFlat = backgroundColorState.colorStops.flatMap(
        (cs: any) => [cs.stop, cs.color]
      );
  
      if (backgroundColorState.gradientDirection === 'radial') {
        backgroundRect.fillPriority('radial-gradient');
        backgroundRect.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
        backgroundRect.fillRadialGradientStartRadius(0);
        backgroundRect.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
        backgroundRect.fillRadialGradientEndRadius(Math.sqrt(width * width + height * height) / 2);
        backgroundRect.fillRadialGradientColorStops(colorStopsFlat);
      } else {
        backgroundRect.fillPriority('linear-gradient');
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };
  
        switch (backgroundColorState.gradientDirection) {
          case 'left-to-right': end = { x: width, y: 0 }; break;
          case 'diagonal-tl-br': end = { x: width, y: height }; break;
          case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
          default: end = { x: 0, y: height }; // top-to-bottom
        }
  
        backgroundRect.fillLinearGradientStartPoint(start);
        backgroundRect.fillLinearGradientEndPoint(end);
        backgroundRect.fillLinearGradientColorStops(colorStopsFlat);
      }
    } else {
      backgroundRect.fillPriority('color');
      backgroundRect.fill(backgroundColorState.solidColor);
    }
  
    backgroundRect.getLayer()?.batchDraw();
  }, [canvasRef, backgroundColorState, backgroundImage, isKonvaReady]);
  

  useEffect(() => {
    if (isKonvaReady) {
      drawBackground();
    }
  }, [drawBackground, isKonvaReady]);

  return {
    backgroundColor: backgroundColorState,
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
};