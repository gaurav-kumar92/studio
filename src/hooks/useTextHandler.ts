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
    if (!canvasRef.current?.stage || !canvasRef.current?.layer) {
      console.warn('Stage or layer not available');
      return;
    }
    
    if (typeof window === 'undefined' || !window.Konva) {
      console.error('Konva is not loaded');
      return;
    }

    const { stage, layer } = canvasRef.current;

    const isEditing = !!(config.id && layer.findOne(`#${config.id}`));

    if (!isEditing && (!config.text || config.text.trim() === '')) {
      config.text = 'New Text';
    }

    const uniqueId = config.id ?? `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let oldNode = layer.findOne(`#${uniqueId}`);
    let oldAttrs: { [key: string]: any } = {};

    if (oldNode) {
      // Preserve all data attributes from old node
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
      ...(editingTextNode?.getAttrs?.() || {}),
      'data-text': config.text ?? oldAttrs['data-text'] ?? 'New Text',
      'data-font-size': config.fontSize ?? oldAttrs['data-font-size'] ?? 24,
      'data-font-family': config.fontFamily ?? oldAttrs['data-font-family'] ?? 'Arial',
      'data-letter-spacing': config.letterSpacing ?? oldAttrs['data-letter-spacing'] ?? 0,
      'data-line-height': config.lineHeight ?? oldAttrs['data-line-height'] ?? 1.2,
      'data-align': config.align ?? oldAttrs['data-align'] ?? 'left',
      'data-is-bold': config.isBold ?? oldAttrs['data-is-bold'] ?? false,
      'data-is-italic': config.isItalic ?? oldAttrs['data-is-italic'] ?? false,
      'data-is-underline': config.isUnderline ?? oldAttrs['data-is-underline'] ?? false,
      'data-is-strikethrough': config.isStrikethrough ?? oldAttrs['data-is-strikethrough'] ?? false,
      'data-is-shadow': config.isShadow ?? oldAttrs['data-is-shadow'] ?? false,
      'data-shadow-blur': config.shadowBlur ?? oldAttrs['data-shadow-blur'] ?? 10,
      'data-shadow-distance': config.shadowDistance ?? oldAttrs['data-shadow-distance'] ?? 5,
      'data-shadow-opacity': config.shadowOpacity ?? oldAttrs['data-shadow-opacity'] ?? 0.5,
      'data-is-glow': config.isGlow ?? oldAttrs['data-is-glow'] ?? false,
      'data-glow-color': config.glowColor ?? oldAttrs['data-glow-color'] ?? '#ffffff',
      'data-glow-blur': config.glowBlur ?? oldAttrs['data-glow-blur'] ?? 10,
      'data-glow-opacity': config.glowOpacity ?? oldAttrs['data-glow-opacity'] ?? 0.8,
      'data-radius': config.radius ?? oldAttrs['data-radius'] ?? 100,
      'data-curvature': config.curvature ?? oldAttrs['data-curvature'] ?? 0,
      // Preserve color configuration
      'data-is-gradient': config.isGradient ?? oldAttrs['data-is-gradient'] ?? false,
      'data-solid-color': config.solidColor ?? oldAttrs['data-solid-color'] ?? '#000000',
      'data-color-stops': config.colorStops ?? oldAttrs['data-color-stops'] ?? [],
      'data-gradient-direction': config.gradientDirection ?? oldAttrs['data-gradient-direction'] ?? 'top-to-bottom',
    };

    // Extract config values with defaults
    const textConfig = {
      text: dataAttrs['data-text'],
      fontSize: dataAttrs['data-font-size'],
      fontFamily: dataAttrs['data-font-family'],
      letterSpacing: dataAttrs['data-letter-spacing'],
      lineHeight: dataAttrs['data-line-height'],
      align: dataAttrs['data-align'],
      isBold: dataAttrs['data-is-bold'],
      isItalic: dataAttrs['data-is-italic'],
      isUnderline: dataAttrs['data-is-underline'],
      isStrikethrough: dataAttrs['data-is-strikethrough'],
      isShadow: dataAttrs['data-is-shadow'],
      shadowBlur: dataAttrs['data-shadow-blur'],
      shadowDistance: dataAttrs['data-shadow-distance'],
      shadowOpacity: dataAttrs['data-shadow-opacity'],
      isGlow: dataAttrs['data-is-glow'],
      glowColor: dataAttrs['data-glow-color'],
      glowBlur: dataAttrs['data-glow-blur'],
      glowOpacity: dataAttrs['data-glow-opacity'],
      radius: dataAttrs['data-radius'],
      curvature: dataAttrs['data-curvature'],
    };

    let newNode: any;
    const x = oldNode ? oldNode.x() : stage.width() / 2;
    const y = oldNode ? oldNode.y() : stage.height() / 2;

    if (textConfig.curvature > 0) {
      // Circular text
      const circularGroup = new window.Konva.Group({
        x, y, draggable: true, name: 'circularText', id: uniqueId, ...dataAttrs,
      });
      newNode = circularGroup;

      const tempText = new window.Konva.Text({ 
        text: textConfig.text, 
        fontSize: textConfig.fontSize, 
        fontFamily: textConfig.fontFamily 
      });
      const charHeight = tempText.height();

      const maxAngleRadians = 2 * Math.PI * (textConfig.curvature / 100);
      let totalFlatWidth = 0;
      for (const char of textConfig.text) {
        tempText.text(char);
        totalFlatWidth += tempText.width();
      }
      const totalFlatAngle = totalFlatWidth / textConfig.radius;
      const scaleFactor = (totalFlatAngle > 0 && maxAngleRadians > 0) ? maxAngleRadians / totalFlatAngle : 0;

      let cumulativeAngle = 0;
      const fontStyle = `${textConfig.isBold ? 'bold ' : ''}${textConfig.isItalic ? 'italic ' : ''}`.trim();
      const decorations: string[] = [];
      if (textConfig.isUnderline) decorations.push('underline');
      if (textConfig.isStrikethrough) decorations.push('line-through');

      for (let i = 0; i < textConfig.text.length; i++) {
        const ch = textConfig.text[i];
        tempText.text(ch);
        const charWidth = tempText.width();
        const charAngularWidth = charWidth / textConfig.radius;
        const scaledAngularWidth = charAngularWidth * scaleFactor;
        const centerAngle = cumulativeAngle + scaledAngularWidth / 2;
        const placementAngle = centerAngle - Math.PI / 2;

        const charNodeX = textConfig.radius * Math.cos(placementAngle);
        const charNodeY = textConfig.radius * Math.sin(placementAngle);
        const rotationDegrees = (centerAngle * 180) / Math.PI;

        const charNode = new window.Konva.Text({
          text: ch, 
          x: charNodeX, 
          y: charNodeY, 
          fontSize: textConfig.fontSize, 
          fontFamily: textConfig.fontFamily,
          fontStyle, 
          textDecoration: decorations.join(' '), 
          rotation: rotationDegrees,
          offsetX: charWidth / 2, 
          offsetY: charHeight / 2, 
          name: 'mainChar', 
          fill: dataAttrs['data-solid-color'], // Use actual color from config
        });

        if (textConfig.isGlow) {
          const glowNode = charNode.clone({
            fill: textConfig.glowColor, 
            stroke: textConfig.glowColor, 
            strokeWidth: textConfig.glowBlur, 
            name: 'glowEffect',
          });
          glowNode.cache();
          glowNode.filters([window.Konva.Filters.Blur]);
          glowNode.blurRadius(textConfig.glowBlur);
          glowNode.opacity(textConfig.glowOpacity);
          circularGroup.add(glowNode);
        }

        if (textConfig.isShadow) {
          charNode.shadowEnabled(true);
          charNode.shadowColor('#000000');
          charNode.shadowBlur(textConfig.shadowBlur);
          charNode.shadowOffset({ x: textConfig.shadowDistance, y: textConfig.shadowDistance });
          charNode.shadowOpacity(textConfig.shadowOpacity);
        } else {
          charNode.shadowEnabled(false);
        }

        circularGroup.add(charNode);
        cumulativeAngle += scaledAngularWidth;
      }
      const totalArcWidth = cumulativeAngle;
      circularGroup.rotation(-(totalArcWidth * 180) / (2 * Math.PI));
      
      tempText.destroy(); // Clean up temp text
    } else {
      // Regular text
      const textGroup = new window.Konva.Group({
        x, y, draggable: true, name: 'textGroup', id: uniqueId, ...dataAttrs,
      });
      newNode = textGroup;

      const mainText = new window.Konva.Text({
        text: textConfig.text,
        fontSize: textConfig.fontSize,
        fontFamily: textConfig.fontFamily,
        letterSpacing: textConfig.letterSpacing,
        lineHeight: textConfig.lineHeight,
        align: textConfig.align,
        fill: dataAttrs['data-solid-color'], // Use actual color from config
        name: 'text',
      });

      textGroup.offsetX(mainText.width() / 2);
      textGroup.offsetY(mainText.height() / 2);

      const decorations: string[] = [];
      if (textConfig.isUnderline) decorations.push('underline');
      if (textConfig.isStrikethrough) decorations.push('line-through');
      mainText.textDecoration(decorations.join(' '));
      mainText.fontStyle(`${textConfig.isBold ? 'bold ' : ''}${textConfig.isItalic ? 'italic ' : ''}`.trim());

      if (textConfig.isGlow) {
        const glowText = mainText.clone({
          fill: textConfig.glowColor, 
          stroke: textConfig.glowColor, 
          strokeWidth: textConfig.glowBlur, 
          name: 'glowEffect',
        });
        glowText.cache();
        glowText.filters([window.Konva.Filters.Blur]);
        glowText.blurRadius(textConfig.glowBlur);
        glowText.opacity(textConfig.glowOpacity);
        textGroup.add(glowText);
      }

      if (textConfig.isShadow) {
        mainText.shadowEnabled(true);
        mainText.shadowColor('#000000');
        mainText.shadowBlur(textConfig.shadowBlur);
        mainText.shadowOffset({ x: textConfig.shadowDistance, y: textConfig.shadowDistance });
        mainText.shadowOpacity(textConfig.shadowOpacity);
      } else {
        mainText.shadowEnabled(false);
      }

      textGroup.add(mainText);
    }

    if (newNode) {
      attachDoubleClick(newNode);
      layer.add(newNode);

      // Apply gradient/fill only if gradient is enabled
      const colorConfig = {
        isGradient: dataAttrs['data-is-gradient'],
        solidColor: dataAttrs['data-solid-color'],
        colorStops: dataAttrs['data-color-stops'],
        gradientDirection: dataAttrs['data-gradient-direction'],
      };
      
      if (colorConfig.isGradient && colorConfig.colorStops?.length > 0) {
        applyFill(newNode, colorConfig);
      }
      
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
    if (!node) {
      console.warn('No editing text node found');
      return;
    }
  
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
