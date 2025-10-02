
'use client';

import { useState, useCallback } from 'react';

type UseMaskHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNode: (node: any) => void;
    setIsLoading: (isLoading: boolean) => void;
};

export const useMaskHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNode,
    setIsLoading,
}: UseMaskHandlerProps) => {
    const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
    const [editingMaskNode, setEditingMaskNode] = useState<any>(null);

    const addImageToMask = useCallback((maskGroup: any) => {
        if (!maskGroup || maskGroup.name() !== 'mask' || !canvasRef.current?.layer) return;
        const layer = canvasRef.current.layer;

        if (document.querySelector('#mask-image-file-input')) {
            return;
        }
  
        const imageFileInput = document.createElement('input');
        imageFileInput.id = 'mask-image-file-input';
        imageFileInput.type = 'file';
        imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";
        imageFileInput.style.display = 'none';
        document.body.appendChild(imageFileInput);
  
        imageFileInput.onchange = () => {
            if (imageFileInput.files && imageFileInput.files.length > 0) {
                const file = imageFileInput.files[0];
                const reader = new FileReader();
                reader.onloadstart = () => setIsLoading(true);
                reader.onload = (e) => {
                    window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                        maskGroup.find('.placeholder-icon, .mask-image').forEach((child: any) => child.destroy());
                        
                        const maskWidth = maskGroup.width();
                        const maskHeight = maskGroup.height();
                        const imgWidth = img.width();
                        const imgHeight = img.height();
                        
                        const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);
                        
                        img.setAttrs({
                            name: 'mask-image',
                            x: 0,
                            y: 0,
                            scaleX: scale,
                            scaleY: scale,
                            draggable: true,
                             dragBoundFunc: function(pos: { x: number, y: number }) {
                              const imageRect = this.getClientRect({skipTransform: false});
                              
                              const minX = maskWidth - imageRect.width;
                              const maxX = 0;
                              const minY = maskHeight - imageRect.height;
                              const maxY = 0;
                              
                              const boundedX = Math.max(minX, Math.min(pos.x, maxX));
                              const boundedY = Math.max(minY, Math.min(pos.y, maxY));
                              
                              return {
                                  x: boundedX,
                                  y: boundedY,
                              };
                            }
                        });
                        
                        const borderShape = maskGroup.findOne('.border-shape');
                        if (borderShape) {
                             borderShape.fill('transparent'); 
                        }
                        
                        maskGroup.add(img);
                        img.moveToBottom();
  
                        layer.draw();
                        updateLayers();
                        setIsLoading(false);
                    });
                };
                reader.onerror = () => {
                  setIsLoading(false);
                  console.error("Failed to read file");
                };
                reader.readAsDataURL(file);
            }
            if (imageFileInput.parentNode) {
                imageFileInput.parentNode.removeChild(imageFileInput);
            }
        };
        imageFileInput.click();
    }, [updateLayers, setIsLoading]);

    const handleAddMask = useCallback((config: any) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        const { stage, layer } = canvasRef.current;
    
        const size = 150;
        
        let borderShape: any;
        let clipShape: any;

        const group = new window.Konva.Group({
            x: stage.width() / 4,
            y: stage.height() / 4,
            draggable: true,
            name: 'mask',
            'data-type': config.type,
            'data-letter': config.letter,
        });
    
        const commonAttrs = {
            stroke: config.borderColor,
            strokeWidth: config.borderThickness,
            name: 'border-shape', 
            fill: '#f0f0f0', 
        };
    
        switch (config.type) {
            case 'circle':
                 borderShape = new window.Konva.Circle({ 
                    ...commonAttrs, 
                    x: size / 2,
                    y: size / 2,
                    radius: size / 2,
                });
                break;
            case 'star':
                borderShape = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: size / 4, outerRadius: size / 2, x: size / 2, y: size / 2 });
                break;
            case 'triangle':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2, x: size / 2, y: size / 2 });
                break;
            case 'polygon':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size / 2, x: size / 2, y: size / 2 });
                break;
            case 'diamond':
                 borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / Math.sqrt(2), x: size / 2, y: size / 2 });
                break;
            case 'alphabet':
                const tempText = new window.Konva.Text({
                    text: config.letter || 'A',
                    fontSize: size,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold',
                });
                const textWidth = tempText.width();
                
                borderShape = new window.Konva.Text({
                    ...commonAttrs,
                    x: 0,
                    y: 0,
                    width: textWidth,
                    text: config.letter || 'A',
                    fontSize: size,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold',
                    align: 'center',
                    verticalAlign: 'middle',
                });
                break;
            default: // rect
                 borderShape = new window.Konva.Rect({ 
                    ...commonAttrs,
                    x: 0,
                    y: 0,
                    width: size, 
                    height: size,
                 });
                break;
        }

        group.add(borderShape);

        const bbox = borderShape.getClientRect({ relativeTo: group });
        group.width(bbox.width);
        group.height(bbox.height);

        clipShape = borderShape.clone();
        clipShape.x(clipShape.x() - bbox.x);
        clipShape.y(clipShape.y() - bbox.y);
    
        const placeholderSvgPath = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
        const placeholderIcon = new window.Konva.Path({
            data: placeholderSvgPath,
            fill: '#9ca3af',
            scale: { x: 2.5, y: 2.5 },
            name: 'placeholder-icon',
            x: group.width() / 2,
            y: group.height() / 2,
            offsetX: 12,
            offsetY: 12,
        });
        group.add(placeholderIcon);
    
        group.clipFunc(function (ctx: any) {
            clipShape.fill('black');
            clipShape.stroke(null);
            clipShape.strokeWidth(0);
            clipShape._sceneFunc(ctx);
        });
    
        layer.add(group);
        updateLayers();
        layer.draw();
        setSelectedNode(group);
        setMaskDialogOpen(false);
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        group.setAttr('id', uniqueId);
    
    }, [canvasRef, updateLayers, setSelectedNode, setMaskDialogOpen]);

    const handleUpdateMask = useCallback((attrs: any) => {
        if (!editingMaskNode) return;
        const border = editingMaskNode.findOne('.border-shape');
        if (border) {
          if (attrs.borderColor) {
            border.stroke(attrs.borderColor);
          }
          if (attrs.borderThickness !== undefined) {
            border.strokeWidth(attrs.borderThickness);
          }
           if (attrs.sides && border.getClassName() === 'RegularPolygon') {
            border.sides(attrs.sides);
          }
        }
        
        const clipShape = border.clone();
        const bbox = border.getClientRect({ relativeTo: editingMaskNode });
        clipShape.x(clipShape.x() - bbox.x);
        clipShape.y(clipShape.y() - bbox.y);

        editingMaskNode.clipFunc(function (ctx: any) {
            clipShape.fill('black');
            clipShape.stroke(null);
            clipShape.strokeWidth(0);
            clipShape._sceneFunc(ctx);
        });

        canvasRef.current?.layer.draw();
    }, [editingMaskNode, canvasRef]);


    return {
        isMaskDialogOpen,
        setMaskDialogOpen,
        editingMaskNode,
        setEditingMaskNode,
        handleAddMask,
        handleUpdateMask,
        addImageToMask,
    };
};
