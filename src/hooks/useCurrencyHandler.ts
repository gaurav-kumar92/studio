'use client';

import { useCallback } from 'react';

export const useCurrencyHandler = ({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord }) => {
    const handleAddCurrency = useCallback((currency: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;

        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const textNode = new window.Konva.Text({
            id: uniqueId,
            text: currency,
            x: stage.width() / 2,
            y: stage.height() / 2,
            fontSize: 100, // Default size for currency symbols
            fontFamily: 'Inter',
            fill: '#000000',
            draggable: true,
            name: 'text', // Treat it as a text object for properties panel
            offsetX: 0, // Will be set after calculating width
            offsetY: 0, // Will be set after calculating height
        });

        // Center the text node based on its actual rendered size
        const textWidth = textNode.width();
        const textHeight = textNode.height();
        textNode.offsetX(textWidth / 2);
        textNode.offsetY(textHeight / 2);

        attachDoubleClick(textNode);
        layer.add(textNode);
        updateLayers();
        setSelectedNodes([textNode]);
        layer.draw();
        forceRecord();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddCurrency };
};
