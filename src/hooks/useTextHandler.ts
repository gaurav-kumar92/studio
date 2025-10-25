
'use client';
import { useState, useCallback } from 'react';

type UseTextHandlerProps = {
  canvasRef: React.RefObject<{ stage: any; layer: any }>;
  updateLayers: () => void;
  deselectNode: () => void;
  setSelectedNodes: (nodes: any[]) => void;
  applyFill: (node: any, config: any) => void;
  attachDoubleClick: (node: any) => void;
  editingTextNode: any;
  setEditingTextNode: (node: any) => void;
  forceRecord?: () => void;
};

export const useTextHandler = ({
  canvasRef,
  updateLayers,
  deselectNode,
  setSelectedNodes,
  applyFill,
  attachDoubleClick,
  editingTextNode,
  setEditingTextNode,
  forceRecord,
}: UseTextHandlerProps) => {
  const ensureId = (node: any) => {
    if (!node?.id?.()) {
      node.id(`node-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    }
    return node.id();
  };

  const handleAddOrUpdateText = useCallback((config: any) => {
    if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
    const { stage, layer } = canvasRef.current;

    const isEditing = !!(config.id && layer.findOne(`#${config.id}`));

    if (!isEditing && (!config.text || config.text.trim() === '')) {
      config.text = 'New Text';
    }

    const uniqueId = config.id ?? `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let oldNode = layer.findOne(`#${uniqueId}`);
    let oldAttrs: { [key: string]: any } = {};

    if (oldNode) {
      Object.keys(oldNode.attrs).forEach((key) => {
        if (key.startsWith('data-')) oldAttrs[key] = oldNode.attrs[key];
      });
      oldNode.destroy();
      if(editingTextNode?.id?.() === uniqueId) {
          setEditingTextNode(null);
      }
    }
    
    // Merge old data, current node data, and new config from dialog
    const dataAttrs: any = {
      ...oldAttrs,
      ...(editingTextNode?.getAttrs() || {}),
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


    let newNode: any;
    const x = oldNode ? oldNode.x() : stage.width() / 2;
    const y = oldNode ? oldNode.y() : stage.height() / 2;

    if (config.curvature > 0) {
      const circularGroup = new window.Konva.Group({
        x, y, draggable: true, name: 'circularText', id: uniqueId, ...dataAttrs,
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
      const fontStyle = `${config.isBold ? 'bold ' : ''}${config.isItalic ? 'italic ' : ''}`.trim();
      const decorations: string[] = [];
      if (config.isUnderline) decorations.push('underline');
      if (config.isStrikethrough) decorations.push('line-through');

      for (let i = 0; i < config.text.length; i++) {
        const ch = config.text[i];
        tempText.text(ch);
        const charWidth = tempText.width();
        const charAngularWidth = charWidth / config.radius;
        const scaledAngularWidth = charAngularWidth * scaleFactor;
        const centerAngle = cumulativeAngle + scaledAngularWidth / 2;
        const placementAngle = centerAngle - Math.PI / 2;

        const charNodeX = config.radius * Math.cos(placementAngle);
        const charNodeY = config.radius * Math.sin(placementAngle);
        const rotationDegrees = (centerAngle * 180) / Math.PI;

        const charNode = new window.Konva.Text({
          text: ch, x: charNodeX, y: charNodeY, fontSize: config.fontSize, fontFamily: config.fontFamily,
          fontStyle, textDecoration: decorations.join(' '), rotation: rotationDegrees,
          offsetX: charWidth / 2, offsetY: charHeight / 2, name: 'mainChar', fill: '#000000',
        });

        if (config.isGlow) {
          const glowNode = charNode.clone({
            fill: config.glowColor, stroke: config.glowColor, strokeWidth: config.glowBlur, name: 'glowEffect',
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
      circularGroup.rotation(-(totalArcWidth * 180) / (2 * Math.PI));
    } else {
      const textGroup = new window.Konva.Group({
        x, y, draggable: true, name: 'textGroup', id: uniqueId, ...dataAttrs,
      });
      newNode = textGroup;

      const mainText = new window.Konva.Text({
        text: config.text,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        letterSpacing: config.letterSpacing,
        lineHeight: config.lineHeight,
        align: config.align,
        fill: '#000000',
        name: 'text',
      });

      textGroup.offsetX(mainText.width() / 2);
      textGroup.offsetY(mainText.height() / 2);

      const decorations: string[] = [];
      if (config.isUnderline) decorations.push('underline');
      if (config.isStrikethrough) decorations.push('line-through');
      mainText.textDecoration(decorations.join(' '));
      mainText.fontStyle(`${config.isBold ? 'bold ' : ''}${config.isItalic ? 'italic ' : ''}`.trim());

      if (config.isGlow) {
        const glowText = mainText.clone({
          fill: config.glowColor, stroke: config.glowColor, strokeWidth: config.glowBlur, name: 'glowEffect',
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

      const colorConfig = {
        isGradient: dataAttrs['data-is-gradient'] ?? false,
        solidColor: dataAttrs['data-solid-color'] ?? '#000000',
        colorStops: dataAttrs['data-color-stops'] ?? [],
        gradientDirection: dataAttrs['data-gradient-direction'] ?? 'top-to-bottom',
      };
      applyFill(newNode, colorConfig);
      
      setSelectedNodes([newNode]);
      updateLayers();
      layer.draw();

      ensureId(newNode);
      forceRecord?.();
    }
  }, [
    canvasRef,
    editingTextNode,
    deselectNode,
    setSelectedNodes,
    updateLayers,
    applyFill,
    setEditingTextNode,
    attachDoubleClick,
    forceRecord,
  ]);

  const handleTextUpdate = useCallback((config: any) => {
    const node = editingTextNode;
    if (!node) return;
  
    // Combine all attributes: existing node attributes, plus the new config from the dialog
    const newConfig = { ...node.getAttrs(), ...config, id: node.id() };
    
    // Call the single, reliable update function
    handleAddOrUpdateText(newConfig);
  
  }, [editingTextNode, handleAddOrUpdateText]);


  return {
    handleAddOrUpdateText,
    handleTextUpdate,
  };
};
