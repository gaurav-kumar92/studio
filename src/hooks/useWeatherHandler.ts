
'use client';

import { useCallback } from 'react';

type UseWeatherHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    attachDoubleClick: (node: any) => void;
    forceRecord?: () => void;
};

export const useWeatherHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick,
    forceRecord,
}: UseWeatherHandlerProps) => {

    const handleAddWeather = useCallback((weather: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;

        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const textNode = new window.Konva.Text({
            id: uniqueId,
            text: weather,
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

    return { handleAddWeather };
};
