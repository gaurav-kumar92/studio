
'use client';

import { useState, useCallback } from 'react';

type UseShapeHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNode: (node: any) => void;
};

export const useShapeHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNode,
}: UseShapeHandlerProps) => {
    const [isShapeDialogOpen, setShapeDialogOpen] = useState(false);
    const [editingShapeNode, setEditingShapeNode] = useState<any>(null);

    const handleAddShape = useCallback((config: any) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        let newShape;
        const x = stage.width() / 4;
        const y = stage.height() / 4;
        const size = 100;
        
        const commonAttrs = {
            x,
            y,
            draggable: true,
            name: 'shape',
            'data-type': config.type,
        };
    
        switch (config.type) {
          case 'rect':
            newShape = new window.Konva.Rect({ ...commonAttrs, width: size, height: size });
            break;
          case 'circle':
            newShape = new window.Konva.Circle({ ...commonAttrs, radius: size / 2 });
            break;
          case 'triangle':
            newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2 });
            break;
          case 'line':
            newShape = new window.Konva.Line({ ...commonAttrs, points: [0, 0, size, 0], strokeWidth: config.thickness, x: x, y: y });
            newShape.x(x); 
            newShape.y(y);
            break;
          case 'curve':
            newShape = new window.Konva.Line({ ...commonAttrs, points: [0, 0, size / 2, size / 2, size, 0], strokeWidth: config.thickness, tension: config.tension, x: x, y: y, 'data-tension': config.tension, });
            newShape.x(x);
            newShape.y(y);
            break;
          case 'star':
            newShape = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: 20, outerRadius: 40 });
            break;
          case 'pentagon':
            newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 5, radius: size / 2 });
            break;
          case 'polygon':
            newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size/2 });
            break;
          case 'arrow':
            newShape = new window.Konva.Arrow({ ...commonAttrs, points: [0, 0, size, 0], pointerLength: 10, pointerWidth: 10, strokeWidth: config.thickness, x: x, y: y });
            newShape.x(x);
            newShape.y(y);
            break;
        }
        if(newShape) {
           newShape.setAttrs({
                'data-is-gradient': false,
                'data-solid-color': '#3b82f6',
            });
            if (config.type === 'line' || config.type === 'arrow' || config.type === 'curve') {
                newShape.stroke('#3b82f6');
                if (config.type === 'arrow') newShape.fill('#3b82f6');
            } else {
                newShape.fill('#3b82f6');
            }
          layer.add(newShape);
          updateLayers();
          layer.draw();
          setSelectedNode(newShape);
          newShape.setAttr('id', uniqueId);
        }
        setShapeDialogOpen(false);
      }, [canvasRef, updateLayers, setSelectedNode]);
    
      const handleUpdateShape = useCallback((attrs: any) => {
        if (!editingShapeNode || !canvasRef.current) return;
        if (attrs.thickness) {
            editingShapeNode.strokeWidth(attrs.thickness);
        }
        if (attrs.sides && editingShapeNode.getClassName() === 'RegularPolygon') {
            editingShapeNode.sides(attrs.sides);
        }
        if (attrs.tension !== undefined) {
            editingShapeNode.tension(attrs.tension);
            editingShapeNode.setAttr('data-tension', attrs.tension);
        }
        canvasRef.current.layer.draw();
      }, [editingShapeNode, canvasRef]);

    return {
        isShapeDialogOpen,
        setShapeDialogOpen,
        editingShapeNode,
        setEditingShapeNode,
        handleAddShape,
        handleUpdateShape,
    };
};
