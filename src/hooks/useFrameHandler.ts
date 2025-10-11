//The name of this file is useFrameHandler.ts
'use client';

import { useState, useCallback } from 'react';

type UseFrameHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    attachDoubleClick: (node: any) => void;
    saveState: (command: any) => void;
};

export const useFrameHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick,
    saveState,
}: UseFrameHandlerProps) => {
    const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
    const [editingFrameNode, setEditingFrameNode] = useState<any>(null);

    const handleAddFrame = useCallback((config: any) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        const { stage, layer } = canvasRef.current;
        
        let newFrame;
        const size = 100;
        const x = stage.width() / 4;
        const y = stage.height() / 4;
        
    
        const commonAttrs = {
            x: x, 
            y: y,
            strokeWidth: config.thickness,
            draggable: true,
            name: 'frame',
            'data-type': config.type
        };
    
        switch (config.type) {
          case 'rect':
            newFrame = new window.Konva.Rect({ ...commonAttrs, width: size, height: size });
            break;
          case 'circle':
            newFrame = new window.Konva.Circle({ ...commonAttrs, radius: size / 2, x: x + size/2, y: y + size/2 });
            break;
          case 'triangle':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2, x: x + size/2, y: y + size/2 });
            break;
          case 'star':
            newFrame = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: 20, outerRadius: 40, x: x + size/2, y: y + size/2 });
            break;
          case 'polygon':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size/2, x: x + size/2, y: y + size/2 });
            break;
          case 'diamond':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / (Math.sqrt(2)), x: x + size/2, y: y + size/2 });
            break;
        }
    
        if(newFrame) {
          const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          newFrame.setAttrs({
            'data-is-gradient': false,
            'data-solid-color': config.color || '#3b82f6',
            id: uniqueId,
          });
          newFrame.stroke(config.color || '#3b82f6');
        
          attachDoubleClick(newFrame);
          layer.add(newFrame);
          updateLayers();
          layer.draw();
          setSelectedNodes([newFrame]);
          
          saveState({ type: 'ADD', targets: [{ id: uniqueId, config: newFrame.toObject() }] });
        }
        setFrameDialogOpen(false);
      }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, saveState]);
    
      const handleUpdateFrame = useCallback((attrs: any) => {
        if (!editingFrameNode) return;
      
        const beforeState = [{ id: editingFrameNode.id(), config: editingFrameNode.toObject() }];

        if (attrs.thickness) {
          editingFrameNode.strokeWidth(attrs.thickness);
        }
        if (attrs.sides && editingFrameNode.getClassName() === 'RegularPolygon') {
          editingFrameNode.sides(attrs.sides);
        }
        canvasRef.current?.layer.draw();

        const afterState = [{ id: editingFrameNode.id(), config: editingFrameNode.toObject() }];
        saveState({ type: 'UPDATE', before: beforeState, after: afterState });
      }, [editingFrameNode, canvasRef, saveState]);

    return {
        isFrameDialogOpen,
        setFrameDialogOpen,
        editingFrameNode,
        setEditingFrameNode,
        handleAddFrame,
        handleUpdateFrame,
    };
};
