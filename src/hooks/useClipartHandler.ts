
'use client';

import { useCallback } from 'react';

type UseClipartHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    attachDoubleClick: (node: any) => void;
};

export const useClipartHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    setIsLoading,
    attachDoubleClick,
}: UseClipartHandlerProps) => {

    const handleAddClipart = useCallback((svgString: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        
        setIsLoading(true);

        const dataUrl = `data:image/svg+xml;base64,${window.btoa(svgString)}`;

        window.Konva.Image.fromURL(dataUrl, (img: any) => {
            if (!canvasRef.current?.stage || !canvasRef.current?.layer) {
                setIsLoading(false);
                return;
            }

            const { stage, layer } = canvasRef.current;
            const MAX_WIDTH = stage.width() * 0.25;
            const MAX_HEIGHT = stage.height() * 0.25;

            const scale = Math.min(MAX_WIDTH / img.width(), MAX_HEIGHT / img.height(), 1);

            const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            img.setAttrs({
                id: uniqueId,
                x: (stage.width() - img.width() * scale) / 2,
                y: (stage.height() - img.height() * scale) / 2,
                scaleX: scale,
                scaleY: scale,
                name: 'clipart',
                draggable: true,
                'data-svg-string': svgString, // Store original SVG
            });

            // The clipart group is what gets selected and transformed.
            const clipartGroup = new window.Konva.Group({
                id: `group-${uniqueId}`,
                draggable: true,
                name: 'clipart',
                x: img.x(),
                y: img.y(),
            });

            img.x(0);
            img.y(0);
            clipartGroup.add(img);

            attachDoubleClick(clipartGroup);

            layer.add(clipartGroup);
            updateLayers();
            setSelectedNodes([clipartGroup]);
            layer.draw();
            setIsLoading(false);
        });

    }, [canvasRef, updateLayers, setSelectedNodes, setIsLoading, attachDoubleClick]);

    return {
        handleAddClipart,
    };
};
