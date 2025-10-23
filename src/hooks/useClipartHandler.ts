
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

    const handleAddClipart = useCallback((parts: { [key: string]: string }) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        
        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const group = new window.Konva.Group({
            id: uniqueId,
            x: stage.width() / 4,
            y: stage.height() / 4,
            draggable: true,
            name: 'clipart',
            scale: { x: 0.5, y: 0.5 }
        });

        const face = new window.Konva.Path({
            data: parts.face,
            fill: '#3b82f6',
            name: 'clipart-face',
        });
        const leftEye = new window.Konva.Path({
            data: parts.leftEye,
            fill: 'black',
            name: 'clipart-leftEye',
        });
        const rightEye = new window.Konva.Path({
            data: parts.rightEye,
            fill: 'black',
            name: 'clipart-rightEye',
        });
        const mouth = new window.Konva.Path({
            data: parts.mouth,
            fill: 'black',
            name: 'clipart-mouth',
        });

        group.add(face, leftEye, rightEye, mouth);

        const bounds = group.getClientRect({ skipTransform: true });
        group.offsetX(bounds.width / 2);
        group.offsetY(bounds.height / 2);

        group.setAttrs({
            'data-is-gradient': false,
            'data-solid-color': '#3b82f6',
        });

        attachDoubleClick(group);
        layer.add(group);
        updateLayers();
        setSelectedNodes([group]);
        layer.draw();
        forceRecord?.();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddClipart };
};
