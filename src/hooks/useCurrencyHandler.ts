
'use client';

import { useCallback } from 'react';

export const useCurrencyHandler = ({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord }) => {
    const handleAddCurrency = useCallback((currency: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;

        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const textNode = new window.Konva.Text({
            text: currency,
            fontSize: 100,
            fontFamily: 'Inter',
            fill: '#000000',
            name: 'text',
        });
        
        const textGroup = new window.Konva.Group({
            id: uniqueId,
            x: stage.width() / 2,
            y: stage.height() / 2,
            draggable: true,
            name: 'textGroup',
            'data-text': currency,
            'data-font-size': 100,
            'data-font-family': 'Inter',
            'data-is-gradient': false,
            'data-solid-color': '#000000',
        });

        textGroup.add(textNode);
        
        const textWidth = textGroup.width();
        const textHeight = textGroup.height();
        textGroup.offsetX(textWidth / 2);
        textGroup.offsetY(textHeight / 2);

        attachDoubleClick(textGroup);
        layer.add(textGroup);
        updateLayers();
        setSelectedNodes([textGroup]);
        layer.draw();
        forceRecord();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddCurrency };
};
