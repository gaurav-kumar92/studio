'use client';

import { useState, useCallback } from 'react';

type UseFrameHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNode: (node: any) => void;
    attachDoubleClick: (node: any) => void;
    saveState: () => void; // ADD THIS
};

export const useFrameHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNode,
    attachDoubleClick,
    saveState, // ADD THIS
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
          newFrame.setAttrs({
            'data-is-gradient': false,
            'data-solid-color': config.color || '#3b82f6',
          });
          newFrame.stroke(config.color || '#3b82f6');
        
          attachDoubleClick(newFrame);
          layer.add(newFrame);
          updateLayers();
          layer.draw();
          setSelectedNode(newFrame);
          const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          newFrame.setAttr('id', uniqueId);
          
          saveState(); // ADD THIS - Save after adding frame
        }
        setFrameDialogOpen(false);
      }, [canvasRef, updateLayers, setSelectedNode, attachDoubleClick, saveState]); // Add saveState to dependencies
    
      const handleUpdateFrame = useCallback((attrs: any) => {
        if (!editingFrameNode) return;
      
        if (attrs.thickness) {
          editingFrameNode.strokeWidth(attrs.thickness);
        }
        if (attrs.sides && editingFrameNode.getClassName() === 'RegularPolygon') {
          editingFrameNode.sides(attrs.sides);
        }
        canvasRef.current?.layer.draw();
        saveState(); // ADD THIS - Save after updating frame
      }, [editingFrameNode, canvasRef, saveState]); // Add saveState to dependencies

    return {
        isFrameDialogOpen,
        setFrameDialogOpen,
        editingFrameNode,
        setEditingFrameNode,
        handleAddFrame,
        handleUpdateFrame,
    };
};