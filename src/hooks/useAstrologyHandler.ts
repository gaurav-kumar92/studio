
'use client';

import { useCallback } from 'react';

type UseAstrologyHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    attachDoubleClick: (node: any) => void;
    forceRecord?: () => void;
};

export const useAstrologyHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick,
    forceRecord,
}: UseAstrologyHandlerProps) => {

    const handleAddAstrology = useCallback((astrology: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;

        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const textNode = new window.Konva.Text({
            id: uniqueId,
            text: astrology,
            x: stage.width() / 2,
            y: stage.height() / 2,
            fontSize: 100,
            fontFamily: 'Inter',
            fill: '#000000',
            draggable: true,
            name: 'text',
        });

        const textWidth = textNode.width();
        const textHeight = textNode.height();
        textNode.offsetX(textWidth / 2);
        textNode.offsetY(textHeight / 2);

        attachDoubleClick(textNode);
        layer.add(textNode);
        updateLayers();
        setSelectedNodes([textNode]);
        layer.draw();
        forceRecord?.();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddAstrology };
};
