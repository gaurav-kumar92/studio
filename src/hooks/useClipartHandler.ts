
'use client';

import { useCallback, useEffect } from 'react';

type UseClipartHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    attachDoubleClick: (node: any) => void;
    forceRecord?: () => void;
};

export const useClipartHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick,
    forceRecord,
}: UseClipartHandlerProps) => {

    const handleAddClipart = useCallback((svgString: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer || typeof window === 'undefined') return;
        
        const { stage, layer } = canvasRef.current;

        // btoa is a client-side only function.
        const dataUrl = `data:image/svg+xml;base64,${window.btoa(svgString)}`;

        window.Konva.Image.fromURL(dataUrl, (img: any) => {
            const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const size = 100;
            const scale = size / img.width();

            img.setAttrs({
                id: uniqueId,
                x: stage.width() / 4,
                y: stage.height() / 4,
                scaleX: scale,
                scaleY: scale,
                name: 'clipart',
                draggable: true,
            });

            attachDoubleClick(img);
            layer.add(img);
            updateLayers();
            setSelectedNodes([img]);
            layer.draw();
            forceRecord?.();
        });
    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddClipart };
};
