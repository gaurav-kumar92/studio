'use client';
import { useCallback } from 'react';

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
    console.log('handleAddOrUpdateText called with:', config);
    
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
      Object.keys(oldNode.attrs).forEach((key) => {
        if (key.startsWith('data-')) oldAttrs[key] = oldNode.attrs[key];
      });
      oldNode.destroy();
      if(editingTextNode?.id?.() === uniqueId) {
          setEditingTextNode(null);
      }
    }
    
    // Merge old data with new config - config takes priority
    const dataAttrs: any = {
      ...oldAttrs,
      'data-text': config.text ?? oldAttrs['data-text'] ?? 'New Text',
      'data-font-size': config.fontSize ?? oldAttrs['data-font-size'] ?? 24,
      'data-font-family': config.fontFamily ?? oldAttrs['data-font-family'] ?? 'Inter',
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
      'data-is-gradient': config.isGradient ?? oldAttrs['data-is-gradient'] ?? false,
      'data-solid-color': config.solidColor ?? oldAttrs['data-solid-color'] ?? '#000000',
      'data-color-stops': config.colorStops ?? oldAttrs['data-color-stops'] ?? [],
      'data-gradient-direction': config.gradientDirection ?? oldAttrs['data-gradient-direction'] ?? 'top-to-bottom',
    };

    console.log('Creating node with dataAttrs:', dataAttrs);

    let newNode: any;
    const x = oldNode ? oldNode.x() : stage.width() / 2;
    const y = oldNode ? oldNode.y() : stage.height() / 2;

    if (dataAttrs['data-curvature'] > 0) {
      const circularGroup = new window.Konva.Group({
        x, y, draggable: true, name: 'circularText', id: uniqueId, ...dataAttrs,
      });
      newNode = circularGroup;

      const tempText = new window.Konva.Text({ 
        text: dataAttrs['data-text'], 
        fontSize: dataAttrs['data-font-size'], 
        fontFamily: dataAttrs['data-font-family'] 
      });
      const charHeight = tempText.height();

      const maxAngleRadians = 2 * Math.PI * (dataAttrs['data-curvature'] / 100);
      let totalFlatWidth = 0;
      for (const char of dataAttrs['data-text']) {
        tempText.text(char);
        totalFlatWidth += tempText.width();
      }
      const totalFlatAngle = totalFlatWidth / dataAttrs['data-radius'];
      const scaleFactor = (totalFlatAngle > 0 && maxAngleRadians > 0) ? maxAngleRadians / totalFlatAngle : 0;

      let cumulativeAngle = 0;
      const fontStyle = `${dataAttrs['data-is-bold'] ? 'bold ' : ''}${dataAttrs['data-is-italic'] ? 'italic ' : ''}`.trim();
      const decorations: string[] = [];
      if (dataAttrs['data-is-underline']) decorations.push('underline');
      if (dataAttrs['data-is-strikethrough']) decorations.push('line-through');

      for (let i = 0; i < dataAttrs['data-text'].length; i++) {
        const ch = dataAttrs['data-text'][i];
        tempText.text(ch);
        const charWidth = tempText.width();
        const charAngularWidth = charWidth / dataAttrs['data-radius'];
        const scaledAngularWidth = charAngularWidth * scaleFactor;
        const centerAngle = cumulativeAngle + scaledAngularWidth / 2;
        const placementAngle = centerAngle - Math.PI / 2;

        const charNodeX = dataAttrs['data-radius'] * Math.cos(placementAngle);
        const charNodeY = dataAttrs['data-radius'] * Math.sin(placementAngle);
        const rotationDegrees = (centerAngle * 180) / Math.PI;

        const charNode = new window.Konva.Text({
          text: ch, 
          x: charNodeX, 
          y: charNodeY, 
          fontSize: dataAttrs['data-font-size'], 
          fontFamily: dataAttrs['data-font-family'],
          fontStyle, 
          textDecoration: decorations.join(' '), 
          rotation: rotationDegrees,
          offsetX: charWidth / 2, 
          offsetY: charHeight / 2, 
          name: 'mainChar', 
          fill: dataAttrs['data-solid-color'],
        });

        if (dataAttrs['data-is-glow']) {
          const glowNode = charNode.clone({
            fill: dataAttrs['data-glow-color'], 
            stroke: dataAttrs['data-glow-color'], 
            strokeWidth: dataAttrs['data-glow-blur'], 
            name: 'glowEffect',
          });
          glowNode.cache();
          glowNode.filters([window.Konva.Filters.Blur]);
          glowNode.blurRadius(dataAttrs['data-glow-blur']);
          glowNode.opacity(dataAttrs['data-glow-opacity']);
          circularGroup.add(glowNode);
        }

        if (dataAttrs['data-is-shadow']) {
          charNode.shadowEnabled(true);
          charNode.shadowColor('#000000');
          charNode.shadowBlur(dataAttrs['data-shadow-blur']);
          charNode.shadowOffset({ x: dataAttrs['data-shadow-distance'], y: dataAttrs['data-shadow-distance'] });
          charNode.shadowOpacity(dataAttrs['data-shadow-opacity']);
        } else {
          charNode.shadowEnabled(false);
        }

        circularGroup.add(charNode);
        cumulativeAngle += scaledAngularWidth;
      }
      const totalArcWidth = cumulativeAngle;
      circularGroup.rotation(-(totalArcWidth * 180) / (2 * Math.PI));
      
      tempText.destroy();
    } else {
      const textGroup = new window.Konva.Group({
        x, y, draggable: true, name: 'textGroup', id: uniqueId, ...dataAttrs,
      });
      newNode = textGroup;

      const mainText = new window.Konva.Text({
        text: dataAttrs['data-text'],
        fontSize: dataAttrs['data-font-size'],
        fontFamily: dataAttrs['data-font-family'],
        letterSpacing: dataAttrs['data-letter-spacing'],
        lineHeight: dataAttrs['data-line-height'],
        align: dataAttrs['data-align'],
        fill: dataAttrs['data-solid-color'],
        name: 'text',
      });

      textGroup.offsetX(mainText.width() / 2);
      textGroup.offsetY(mainText.height() / 2);

      const decorations: string[] = [];
      if (dataAttrs['data-is-underline']) decorations.push('underline');
      if (dataAttrs['data-is-strikethrough']) decorations.push('line-through');
      mainText.textDecoration(decorations.join(' '));
      mainText.fontStyle(`${dataAttrs['data-is-bold'] ? 'bold ' : ''}${dataAttrs['data-is-italic'] ? 'italic ' : ''}`.trim());

      if (dataAttrs['data-is-glow']) {
        const glowText = mainText.clone({
          fill: dataAttrs['data-glow-color'], 
          stroke: dataAttrs['data-glow-color'], 
          strokeWidth: dataAttrs['data-glow-blur'], 
          name: 'glowEffect',
        });
        glowText.cache();
        glowText.filters([window.Konva.Filters.Blur]);
        glowText.blurRadius(dataAttrs['data-glow-blur']);
        glowText.opacity(dataAttrs['data-glow-opacity']);
        textGroup.add(glowText);
      }

      if (dataAttrs['data-is-shadow']) {
        mainText.shadowEnabled(true);
        mainText.shadowColor('#000000');
        mainText.shadowBlur(dataAttrs['data-shadow-blur']);
        mainText.shadowOffset({ x: dataAttrs['data-shadow-distance'], y: dataAttrs['data-shadow-distance'] });
        mainText.shadowOpacity(dataAttrs['data-shadow-opacity']);
      } else {
        mainText.shadowEnabled(false);
      }

      textGroup.add(mainText);
    }

    if (newNode) {
      attachDoubleClick(newNode);
      layer.add(newNode);

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
      
      console.log('Text node created/updated successfully');
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
    console.log('handleTextUpdate called');
    console.log('editingTextNode:', editingTextNode);
    console.log('config received:', config);
    
    if (!editingTextNode) {
      console.warn('No editing text node found');
      return;
    }
  
    // Get the node's ID
    const nodeId = editingTextNode.id?.() || editingTextNode.attrs?.id;
    console.log('Node ID:', nodeId);
    
    if (!nodeId) {
      console.error('Node has no ID!');
      return;
    }
    
    // Merge existing node attrs with new config
    const existingAttrs = editingTextNode.getAttrs?.() || editingTextNode.attrs || {};
    const mergedConfig = { 
      ...existingAttrs, 
      ...config, 
      id: nodeId 
    };
    
    console.log('Merged config:', mergedConfig);
    
    // Call the main update function
    handleAddOrUpdateText(mergedConfig);
  
  }, [editingTextNode, handleAddOrUpdateText]);


  return {
    handleAddOrUpdateText,
    handleTextUpdate,
  };
};