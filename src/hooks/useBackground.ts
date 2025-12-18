
import { useState, useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { useHistory } from './useHistory';

export const useBackground = (canvasRef: React.RefObject<Konva.Stage>,  forceRecord?: () => void)  => {
  const [backgroundColorState, setBackgroundColorState] = useState({
    isGradient: false,
    isTransparent: false,
    solidColor: '#E0E0E0',
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
    const newColorState = { ...backgroundColorState, ...color };

    if (newColorState.isTransparent) {
        newColorState.solidColor = 'transparent';
        newColorState.isGradient = false;
    }

    setBackgroundColorState(newColorState);
    setBackgroundImage(null);
    forceRecord?.();
  };

  const handleSetBackgroundImage = useCallback(() => {
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

  const handleBackgroundImageZoom = (zoom: number) => {
    setBackgroundImageProps(prev => ({ ...prev, scale: prev.scale * zoom }));
  };

  const handleBackgroundImagePan = (pan: { x: number; y: number }) => {
    setBackgroundImageProps(prev => ({ ...prev, x: prev.x + pan.x, y: prev.y + pan.y }));
  };

  const handleBackgroundImageReset = () => {
    setBackgroundImageProps({ x: 0, y: 0, scale: 1 });
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImage(null);
    setBackgroundColorState(prev => ({ ...prev, solidColor: '#E0E0E0', isGradient: false, isTransparent: false }));
    forceRecord?.();
  };

  const drawBackground = useCallback(() => {
    if (!canvasRef.current) return;

    let layer = canvasRef.current.findOne('#background-layer') as Konva.Layer;
    if (!layer) {
        layer = new Konva.Layer({ id: 'background-layer' });
        canvasRef.current.add(layer);
    }

    let backgroundRect = layer.findOne('#background-rect') as Konva.Rect;
    if (!backgroundRect) {
        backgroundRect = new Konva.Rect({ id: 'background-rect', x: 0, y: 0 });
        layer.add(backgroundRect);
    }

    const stage = canvasRef.current.getStage();
    const width = stage.width();
    const height = stage.height();
    backgroundRect.width(width);
    backgroundRect.height(height);

    if (backgroundColorState.isTransparent && !backgroundImage) {
        backgroundRect.fill('transparent');
    } else if (backgroundImage) {
        // Image is handled in Canvas.tsx to be below the Konva stage
    } else if (backgroundColorState.isGradient) {
        const { width, height } = backgroundRect.getClientRect();
        const colorStopsFlat = backgroundColorState.colorStops.flatMap(
          (cs: any) => [cs.stop, cs.color]
        );

        let gradientProps: any = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: height },
            colorStops: colorStopsFlat,
        };

        switch (backgroundColorState.gradientDirection) {
            case 'left-to-right':
                gradientProps.end = { x: width, y: 0 };
                break;
            case 'diagonal-tl-br':
                gradientProps.end = { x: width, y: height };
                break;
            case 'diagonal-tr-bl':
                gradientProps.start = { x: width, y: 0 };
                gradientProps.end = { x: 0, y: height };
                break;
            case 'radial':
                backgroundRect.fillRadialGradient({
                    start: { x: width / 2, y: height / 2 },
                    end: { x: width / 2, y: height / 2 },
                    startRadius: 0,
                    endRadius: width / 2,
                    colorStops: colorStopsFlat,
                });
                layer.batchDraw();
                return;
        }

        backgroundRect.fillLinearGradient(gradientProps.start, gradientProps.end, gradientProps.colorStops);
    } else {
        backgroundRect.fill(backgroundColorState.solidColor);
    }

    layer.batchDraw();
}, [canvasRef, backgroundColorState, backgroundImage]);


  useEffect(() => {
    drawBackground();
  }, [drawBackground, backgroundColorState, backgroundImage, backgroundImageProps]);

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

}
