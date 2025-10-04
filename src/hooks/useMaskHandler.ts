
'use client';

import { useState, useCallback } from 'react';

type UseMaskHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNode: (node: any) => void;
    setIsLoading: (isLoading: boolean) => void;
    attachDoubleClick: (node: any) => void;
};

export const useMaskHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNode,
    setIsLoading,
    attachDoubleClick,
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
    
        let isFileSelected = false;
    
        imageFileInput.onchange = () => {
            isFileSelected = true;
            window.isOpeningFileDialog = false;
            
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
                            'data-original-width': imgWidth,
                            'data-original-height': imgHeight,
                             dragBoundFunc: function(pos: { x: number, y: number}) {
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
                             borderShape.offsetX(0);
                             borderShape.offsetY(0);
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
    
        const handleDialogClose = () => {
            setTimeout(() => {
                if (!isFileSelected && window.isOpeningFileDialog) {
                    window.isOpeningFileDialog = false;
                    if (imageFileInput.parentNode) {
                        imageFileInput.parentNode.removeChild(imageFileInput);
                    }
                }
            }, 300);
        };
    
        window.addEventListener('focus', handleDialogClose, { once: true });
        
        const handleClick = () => {
            setTimeout(() => {
                if (!isFileSelected && window.isOpeningFileDialog) {
                    window.isOpeningFileDialog = false;
                    if (imageFileInput.parentNode) {
                        imageFileInput.parentNode.removeChild(imageFileInput);
                    }
                }
            }, 100);
        };
        
        setTimeout(() => {
            document.addEventListener('click', handleClick, { once: true });
        }, 500);
        
        window.isOpeningFileDialog = true;
        imageFileInput.click();
    }, [updateLayers, setIsLoading]);

    const handleAddMask = useCallback((config: any) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        const { stage, layer } = canvasRef.current;
    
        const size = 150;
        const group = new window.Konva.Group({
            x: stage.width() / 4,
            y: stage.height() / 4,
            width: size,
            height: size,
            draggable: true,
            name: 'mask',
            'data-type': config.type,
            'data-letter': config.letter,
        });
    
        let borderShape: any;
    
        const commonAttrs = {
            x: size / 2, 
            y: size / 2,
            fill: '#f0f0f0', 
            stroke: config.borderColor,
            strokeWidth: config.borderThickness,
            name: 'border-shape',
        };
    
        switch (config.type) {
            case 'circle':
                borderShape = new window.Konva.Circle({ ...commonAttrs, radius: size / 2 });
                break;
            case 'star':
                borderShape = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: size / 4, outerRadius: size / 2 });
                break;
            case 'triangle':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2 });
                break;
            case 'polygon':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size / 2 });
                break;
            case 'diamond':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / (Math.sqrt(2)) });
                break;
            case 'heart':
                borderShape = new window.Konva.Path({
                    x: 0,
                    y: 0,
                    data: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
                    fill: '#f0f0f0', 
                    stroke: config.borderColor,
                    strokeWidth: config.borderThickness,
                    name: 'border-shape',
                    scale: { x: size / 24, y: size / 24 }
                });
                group.width(size);
                group.height(size);
                break;
            case 'alphabet':
                const textForClip = new window.Konva.Text({
                    text: config.letter || 'A',
                    fontSize: size,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold',
                });
                group.width(textForClip.width());
                group.height(textForClip.height());
    
                borderShape = new window.Konva.Text({
                    x: 0,
                    y: 0,
                    width: group.width(),
                    height: group.height(),
                    text: config.letter || 'A',
                    fontSize: size,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold',
                    fill: '#f0f0f0',
                    stroke: config.borderColor,
                    strokeWidth: config.borderThickness,
                    name: 'border-shape',
                });
                break;
            default: // rect
                 borderShape = new window.Konva.Rect({ 
                    x: 0, 
                    y: 0,
                    width: size, 
                    height: size, 
                    fill: '#f0f0f0', 
                    stroke: config.borderColor, 
                    strokeWidth: config.borderThickness,
                    name: 'border-shape',
                });
                break;
        }
    
        if (borderShape) {
            group.add(borderShape);
        }
    
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
    
        // === START OF CORRECTED CLIP FUNCTION ===
        group.clipFunc(function (ctx: any) {
             if (!borderShape) {
                return;
             }
            const className = borderShape.getClassName();
            
            // Shapes with a centered origin need to be drawn at the center of the group
            const centeredOrigin = className === 'Circle' || className === 'Star' || className === 'RegularPolygon';
            
            ctx.beginPath();

            if (centeredOrigin) {
                ctx.save();
                // Move the context origin to the center of the group for these shapes
                ctx.translate(size / 2, size / 2);
                borderShape._sceneFunc(ctx);
                ctx.restore();
            } else {
                // All other shapes (Rect, Text, Path) are drawn from the top-left (0,0)
                borderShape._sceneFunc(ctx);
            }
            
            ctx.closePath();
            ctx.clip();
        });
        // === END OF CORRECTED CLIP FUNCTION ===
    
        attachDoubleClick(group);
        layer.add(group);
        updateLayers();
        layer.draw();
        setSelectedNode(group);
        setMaskDialogOpen(false);
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        group.setAttr('id', uniqueId);
    
      }, [canvasRef, updateLayers, setSelectedNode, setMaskDialogOpen, attachDoubleClick]);

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
