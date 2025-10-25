
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

  const handleAddOrUpdateText = useCallback((config: any) => {
    if (!canvasRef.current?.stage || !canvasRef.current?.layer || !window.Konva) {
      console.warn('Canvas or Konva not ready');
      return;
    }

    const { stage, layer } = canvasRef.current;
    const uniqueId = config.id || `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Destroy the old node if it exists to ensure a clean rebuild
    const oldNode = layer.findOne(`#${uniqueId}`);
    const oldNodePosition = oldNode ? oldNode.position() : { x: stage.width() / 2, y: stage.height() / 2 };
    if (oldNode) {
      oldNode.destroy();
    }

    if (editingTextNode?.id?.() === uniqueId) {
      setEditingTextNode(null);
    }
    
    // Define all attributes for the new node based on the incoming config
    const dataAttrs = {
      'data-text': config.text || 'New Text',
      'data-font-size': config.fontSize || 24,
      'data-font-family': config.fontFamily || 'Inter',
      'data-letter-spacing': config.letterSpacing ?? 0,
      'data-line-height': config.lineHeight ?? 1.2,
      'data-align': config.align || 'left',
      'data-is-bold': config.isBold || false,
      'data-is-italic': config.isItalic || false,
      'data-is-underline': config.isUnderline || false,
      'data-is-strikethrough': config.isStrikethrough || false,
      'data-is-shadow': config.isShadow || false,
      'data-shadow-blur': config.shadowBlur ?? 10,
      'data-shadow-distance': config.shadowDistance ?? 5,
      'data-shadow-opacity': config.shadowOpacity ?? 0.5,
      'data-is-glow': config.isGlow || false,
      'data-glow-color': config.glowColor || '#0000ff',
      'data-glow-blur': config.glowBlur ?? 10,
      'data-glow-opacity': config.glowOpacity ?? 0.7,
      'data-radius': config.radius || 150,
      'data-curvature': config.curvature ?? 0,
      'data-is-gradient': config.isGradient || false,
      'data-solid-color': config.solidColor || '#000000',
      'data-color-stops': config.colorStops || [],
      'data-gradient-direction': config.gradientDirection || 'top-to-bottom',
    };

    let newNode: any;
    
    if (dataAttrs['data-curvature'] > 0) {
      // Logic for Circular Text
      const circularGroup = new window.Konva.Group({
        id: uniqueId,
        name: 'circularText',
        x: oldNodePosition.x,
        y: oldNodePosition.y,
        draggable: true,
        ...dataAttrs,
      });

      const tempText = new window.Konva.Text({ text: 'A', fontSize: dataAttrs['data-font-size'], fontFamily: dataAttrs['data-font-family'] });
      const charHeight = tempText.height();
      const fontStyle = `${dataAttrs['data-is-bold'] ? 'bold ' : ''}${dataAttrs['data-is-italic'] ? 'italic ' : ''}`.trim();
      const decorations = [
        dataAttrs['data-is-underline'] ? 'underline' : '',
        dataAttrs['data-is-strikethrough'] ? 'line-through' : '',
      ].filter(Boolean).join(' ');

      let cumulativeAngle = 0;
      for (const char of dataAttrs['data-text']) {
        tempText.text(char);
        const charWidth = tempText.width();
        const charAngularWidth = (charWidth + dataAttrs['data-letter-spacing']) / dataAttrs['data-radius'];
        const centerAngle = cumulativeAngle + charAngularWidth / 2;
        const placementAngle = centerAngle - Math.PI / 2;

        const charNode = new window.Konva.Text({
          text: char,
          x: dataAttrs['data-radius'] * Math.cos(placementAngle),
          y: dataAttrs['data-radius'] * Math.sin(placementAngle),
          fontSize: dataAttrs['data-font-size'],
          fontFamily: dataAttrs['data-font-family'],
          fontStyle,
          textDecoration: decorations,
          rotation: (centerAngle * 180) / Math.PI,
          offsetX: charWidth / 2,
          offsetY: charHeight / 2,
          name: 'mainChar',
          fill: dataAttrs['data-solid-color'],
        });
        circularGroup.add(charNode);
        cumulativeAngle += charAngularWidth;
      }
      tempText.destroy();
      circularGroup.rotation(-(cumulativeAngle * 180) / (2 * Math.PI));
      newNode = circularGroup;

    } else {
      // Logic for Regular Text
      const textGroup = new window.Konva.Group({
        id: uniqueId,
        name: 'textGroup',
        x: oldNodePosition.x,
        y: oldNodePosition.y,
        draggable: true,
        ...dataAttrs,
      });

      const mainText = new window.Konva.Text({
        text: dataAttrs['data-text'],
        fontSize: dataAttrs['data-font-size'],
        fontFamily: dataAttrs['data-font-family'],
        letterSpacing: dataAttrs['data-letter-spacing'],
        lineHeight: dataAttrs['data-line-height'],
        align: dataAttrs['data-align'],
        fill: dataAttrs['data-solid-color'],
        name: 'text',
        fontStyle: `${dataAttrs['data-is-bold'] ? 'bold ' : ''}${dataAttrs['data-is-italic'] ? 'italic ' : ''}`.trim(),
        textDecoration: [
          dataAttrs['data-is-underline'] ? 'underline' : '',
          dataAttrs['data-is-strikethrough'] ? 'line-through' : '',
        ].filter(Boolean).join(' '),
      });

      if (dataAttrs['data-is-shadow']) {
        mainText.shadowEnabled(true);
        mainText.shadowColor('#000000');
        mainText.shadowBlur(dataAttrs['data-shadow-blur']);
        mainText.shadowOffset({ x: dataAttrs['data-shadow-distance'], y: dataAttrs['data-shadow-distance'] });
        mainText.shadowOpacity(dataAttrs['data-shadow-opacity']);
      }

      textGroup.add(mainText);
      textGroup.offsetX(mainText.width() / 2);
      textGroup.offsetY(mainText.height() / 2);
      newNode = textGroup;
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
      forceRecord?.();
    }
  }, [
    canvasRef,
    setSelectedNodes,
    updateLayers,
    applyFill,
    attachDoubleClick,
    forceRecord,
    editingTextNode,
    setEditingTextNode
  ]);

  return {
    handleAddOrUpdateText,
  };
};
