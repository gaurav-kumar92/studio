
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

    const handleAddClipart = useCallback((clipart: { parts: { [key: string]: string }, defaultColors: { [key: string]: string } }) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        
        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const group = new window.Konva.Group({
            id: uniqueId,
            x: stage.width() / 2,
            y: stage.height() / 2,
            draggable: true,
            name: 'clipart',
        });
        
        Object.entries(clipart.parts).forEach(([partName, pathData]) => {
            const part = new window.Konva.Path({
                data: pathData,
                fill: clipart.defaultColors?.[partName] || 'black',
                name: `clipart-${partName}`,
            });
            group.add(part);
        });
        
        // After adding all parts, get the bounding box.
        const bounds = group.getClientRect({ skipTransform: true });
        
        // Set the offset to the center of the bounding box.
        group.setAttrs({
            width: bounds.width,
            height: bounds.height,
            offsetX: bounds.width / 2,
            offsetY: bounds.height / 2,
        });
        
        // Adjust the position because the offset moves the group.
        group.x(group.x() + bounds.width / 2);
        group.y(group.y() + bounds.height / 2);


        attachDoubleClick(group);
        layer.add(group);
        updateLayers();
        setSelectedNodes([group]);
        layer.draw();
        forceRecord?.();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddClipart };
};

    