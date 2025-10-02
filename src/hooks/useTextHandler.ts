

'use client';

import { useState, useCallback } from 'react';

type UseTextHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    deselectNode: () => void;
    setSelectedNode: (node: any) => void;
    applyFill: (node: any, config: any) => void;
    attachDoubleClick: (node: any) => void;
};

export const useTextHandler = ({
    canvasRef,
    updateLayers,
    deselectNode,
    setSelectedNode,
    applyFill,
    attachDoubleClick,
}: UseTextHandlerProps) => {
    const [isTextDialogOpen, setTextDialogOpen] = useState(false);
    const [editingTextNode, setEditingTextNode] = useState<any>(null);

    const handleAddOrUpdateText = useCallback((config: any) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        const { stage, layer } = canvasRef.current;

        let oldAttrs: { [key: string]: any } = {};
        if (editingTextNode) {
            // Preserve all data attributes from the old node
            Object.keys(editingTextNode.attrs).forEach(key => {
                if (key.startsWith('data-')) {
                    oldAttrs[key] = editingTextNode.attrs[key];
                }
            });
            editingTextNode.destroy();
            deselectNode();
            setEditingTextNode(null);
        }
        
        // Create the final data attributes by merging old and new.
        // New values from the dialog (config) take precedence.
        const dataAttrs = {
            ...oldAttrs,
            'data-text': config.text,
            'data-font-size': config.fontSize,
            'data-font-family': config.fontFamily,
            'data-letter-spacing': config.letterSpacing,
            'data-line-height': config.lineHeight,
            'data-align': config.align,
            'data-is-bold': config.isBold,
            'data-is-italic': config.isItalic,
            'data-is-underline': config.isUnderline,
            'data-is-strikethrough': config.isStrikethrough,
            'data-is-shadow': config.isShadow,
            'data-shadow-blur': config.shadowBlur,
            'data-shadow-distance': config.shadowDistance,
            'data-shadow-opacity': config.shadowOpacity,
            'data-is-glow': config.isGlow,
            'data-glow-color': config.glowColor,
            'data-glow-blur': config.glowBlur,
            'data-glow-opacity': config.glowOpacity,
            'data-radius': config.radius,
            'data-curvature': config.curvature,
        };

        let newNode;
        if (config.curvature > 0) {
            const circularGroup = new window.Konva.Group({
                x: stage.width() / 2,
                y: stage.height() / 2,
                draggable: true,
                name: 'circularText',
                ...dataAttrs
            });
            newNode = circularGroup;

            const tempText = new window.Konva.Text({ text: config.text, fontSize: config.fontSize, fontFamily: config.fontFamily });
            const charHeight = tempText.height();
            const maxAngleRadians = 2 * Math.PI * (config.curvature / 100);

            let totalFlatWidth = 0;
            for (const char of config.text) {
                tempText.text(char);
                totalFlatWidth += tempText.width();
            }
            const totalFlatAngle = totalFlatWidth / config.radius;
            const scaleFactor = (totalFlatAngle > 0 && maxAngleRadians > 0) ? maxAngleRadians / totalFlatAngle : 0;
            let cumulativeAngle = 0;

            const fontStyle = `${config.isBold ? 'bold ' : ''}${config.isItalic ? 'italic' : ''}`.trim();
            const decorations = [];
            if (config.isUnderline) decorations.push('underline');
            if (config.isStrikethrough) decorations.push('line-through');


            for (let i = 0; i < config.text.length; i++) {
                const char = config.text[i];
                tempText.text(char);
                let charWidth = tempText.width();
                const charAngularWidth = charWidth / config.radius;
                const scaledAngularWidth = charAngularWidth * scaleFactor;
                const centerAngle = cumulativeAngle + (scaledAngularWidth / 2);

                const placementAngle = centerAngle - (Math.PI / 2);
                const x = config.radius * Math.cos(placementAngle);
                const y = config.radius * Math.sin(placementAngle);
                const rotationDegrees = centerAngle * 180 / Math.PI;

                const charNode = new window.Konva.Text({
                    text: char,
                    x: x,
                    y: y,
                    fontSize: config.fontSize,
                    fontFamily: config.fontFamily,
                    fontStyle: fontStyle,
                    textDecoration: decorations.join(' '),
                    rotation: rotationDegrees,
                    offsetX: charWidth / 2,
                    offsetY: charHeight / 2,
                    name: 'mainChar',
                    fill: '#000000'
                });

                if (config.isGlow) {
                    const glowNode = charNode.clone({
                        fill: config.glowColor,
                        stroke: config.glowColor,
                        strokeWidth: config.glowBlur,
                        name: 'glowEffect'
                    });
                    glowNode.cache();
                    glowNode.filters([window.Konva.Filters.Blur]);
                    glowNode.blurRadius(config.glowBlur);
                    glowNode.opacity(config.glowOpacity);
                    circularGroup.add(glowNode);
                }

                if (config.isShadow) {
                    charNode.shadowEnabled(true);
                    charNode.shadowColor('#000000');
                    charNode.shadowBlur(config.shadowBlur);
                    charNode.shadowOffset({ x: config.shadowDistance, y: config.shadowDistance });
                    charNode.shadowOpacity(config.shadowOpacity);
                } else {
                    charNode.shadowEnabled(false);
                }

                circularGroup.add(charNode);
                cumulativeAngle += scaledAngularWidth;
            }

            const totalArcWidth = cumulativeAngle;
            circularGroup.rotation(-totalArcWidth * 180 / (2 * Math.PI));

        } else {
            const textGroup = new window.Konva.Group({
                x: stage.width() / 4,
                y: stage.height() / 4,
                draggable: true,
                name: 'textGroup',
                ...dataAttrs
            });
            newNode = textGroup;

            const mainText = new window.Konva.Text({
                ...config,
                fill: '#000000',
                name: 'text',
            });

            let decorations = [];
            if (config.isUnderline) decorations.push('underline');
            if (config.isStrikethrough) decorations.push('line-through');
            mainText.textDecoration(decorations.join(' '));

            mainText.fontStyle(`${config.isBold ? 'bold ' : ''}${config.isItalic ? 'italic' : ''}`.trim());

            if (config.isGlow) {
                const glowText = mainText.clone({
                    fill: config.glowColor,
                    stroke: config.glowColor,
                    strokeWidth: config.glowBlur,
                    name: 'glowEffect'
                });
                glowText.cache();
                glowText.filters([window.Konva.Filters.Blur]);
                glowText.blurRadius(config.glowBlur);
                glowText.opacity(config.glowOpacity);
                textGroup.add(glowText);
            }

            if (config.isShadow) {
                mainText.shadowEnabled(true);
                mainText.shadowColor('#000000');
                mainText.shadowBlur(config.shadowBlur);
                mainText.shadowOffset({ x: config.shadowDistance, y: config.shadowDistance });
                mainText.shadowOpacity(config.shadowOpacity);
            } else {
                mainText.shadowEnabled(false);
            }

            textGroup.add(mainText);
        }

        if (newNode) {
            attachDoubleClick(newNode);
            layer.add(newNode);
            const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            newNode.setAttr('id', uniqueId);

            // Re-apply color/gradient settings from the final data attributes
            const colorConfig = {
                isGradient: dataAttrs['data-is-gradient'] || false,
                solidColor: dataAttrs['data-solid-color'] || '#000000',
                colorStops: dataAttrs['data-color-stops'] || [],
                gradientDirection: dataAttrs['data-gradient-direction'] || 'top-to-bottom',
            };
            applyFill(newNode, colorConfig);

            setSelectedNode(newNode);
        }

        updateLayers();
        layer.draw();
        setTextDialogOpen(false);
    }, [canvasRef, editingTextNode, deselectNode, setSelectedNode, updateLayers, applyFill, setEditingTextNode, setTextDialogOpen, attachDoubleClick]);

    return {
        isTextDialogOpen,
        setTextDialogOpen,
        editingTextNode,
        setEditingTextNode,
        handleAddOrUpdateText,
    };
};

      