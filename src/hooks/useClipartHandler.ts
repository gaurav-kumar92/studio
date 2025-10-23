
'use client';

import { useCallback } from 'react';

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

    const handleAddClipart = useCallback((pathData: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        
        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const path = new window.Konva.Path({
            id: uniqueId,
            data: pathData,
            x: stage.width() / 4,
            y: stage.height() / 4,
            fill: '#3b82f6',
            draggable: true,
            name: 'clipart',
            scale: { x: 0.5, y: 0.5 }
        });
        
        // Center the shape before adding
        const bounds = path.getClientRect({ skipTransform: true });
        path.offsetX(bounds.width / 2);
        path.offsetY(bounds.height / 2);

        path.setAttrs({
            'data-is-gradient': false,
            'data-solid-color': '#3b82f6',
        });

        attachDoubleClick(path);
        layer.add(path);
        updateLayers();
        setSelectedNodes([path]);
        layer.draw();
        forceRecord?.();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddClipart };
};
