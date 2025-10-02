
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useTextHandler } from '@/hooks/useTextHandler';
import { useShapeHandler } from '@/hooks/useShapeHandler';
import { useFrameHandler } from '@/hooks/useFrameHandler';

// This is a global declaration for the Konva object.
declare global {
  interface Window {
    Konva: any;
  }
}

type CanvasContextType = {
  canvasRef: React.RefObject<{ stage: any; layer: any; background: any; }>;
  transformerRef: React.RefObject<any>;
  konvaObjects: any[];
  setKonvaObjects: React.Dispatch<React.SetStateAction<any[]>>;
  selectedNode: any;
  setSelectedNode: React.Dispatch<React.SetStateAction<any>>;
  canvasSize: string;
  setCanvasSize: React.Dispatch<React.SetStateAction<string>>;
  isCanvasReady: boolean;
  setCanvasReady: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundColor: string;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAddItemDialogOpen: boolean;
  setAddItemDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isShapeDialogOpen: boolean;
  setShapeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTextDialogOpen: boolean;
  setTextDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFrameDialogOpen: boolean;
  setFrameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMaskDialogOpen: boolean;
  setMaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingShapeNode: any;
  setEditingShapeNode: React.Dispatch<React.SetStateAction<any>>;
  editingFrameNode: any;
  setEditingFrameNode: React.Dispatch<React.SetStateAction<any>>;
  editingMaskNode: any;
  setEditingMaskNode: React.Dispatch<React.SetStateAction<any>>;
  editingTextNode: any;
  setEditingTextNode: React.Dispatch<React.SetStateAction<any>>;
  updateLayers: () => void;
  selectNode: (node: any) => void;
  deselectNode: () => void;
  handleMoveNode: (action: 'up' | 'down', nodeId: string) => void;
  handleAlign: (position: string) => void;
  handleOpacityChange: (opacity: number) => void;
  handleFlip: (direction: 'horizontal' | 'vertical') => void;
  handleColorUpdate: (config: any) => void;
  handleSelectItem: (itemType: string) => void;
  addImageFromComputer: () => void;
  handleAddShape: (config: any) => void;
  handleUpdateShape: (attrs: any) => void;
  handleAddOrUpdateText: (config: any) => void;
  handleAddFrame: (config: any) => void;
  handleUpdateFrame: (attrs: any) => void;
  handleAddMask: (config: any) => void;
  handleUpdateMask: (attrs: any) => void;
  addImageToMask: (maskGroup: any) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const canvasRef = useRef<{ stage: any; layer: any; background: any; }>(null);
  const transformerRef = useRef<any>(null);
  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState('842x1191');
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
  
  const [editingMaskNode, setEditingMaskNode] = useState<any>(null);

  const updateLayers = useCallback(() => {
    if (!canvasRef.current?.layer) return;
  
    const children = canvasRef.current.layer.getChildren(
      (node: any) => node.name() !== 'background' && node.className !== 'Transformer'
    );
  
    const childrenArray = Array.from(children);
    setKonvaObjects(childrenArray);
  
    canvasRef.current.layer.draw();
  }, []);

  const deselectNode = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const applyFill = useCallback((node: any, config: any) => {
    const targetNodes = (node.hasName('textGroup') || node.hasName('circularText')) 
      ? node.find('.mainChar, .text, Text') 
      : [node];

    targetNodes.forEach((n: any) => {
        if (config.isGradient) {
            let start = { x: 0, y: 0 };
            let end = { x: 0, y: 0 };
            const { width, height } = n.getClientRect({ relativeTo: n.getParent() });

            switch (config.gradientDirection) {
                case 'top-to-bottom': end = { x: 0, y: height }; break;
                case 'left-to-right': end = { x: width, y: 0 }; break;
                case 'diagonal-tl-br': end = { x: width, y: height }; break;
                case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
            }
            n.fill(null);
            n.fillLinearGradientStartPoint(start);
            n.fillLinearGradientEndPoint(end);
            const colorStopsFlat = config.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);
            n.fillLinearGradientColorStops(colorStopsFlat);
        } else {
            n.fillLinearGradientColorStops([]);
            n.fill(config.solidColor);
        }
    });
  }, []);

  const {
    isTextDialogOpen,
    setTextDialogOpen,
    editingTextNode,
    setEditingTextNode,
    handleAddOrUpdateText,
  } = useTextHandler({
    canvasRef,
    updateLayers,
    deselectNode,
    setSelectedNode,
    applyFill,
  });

  const {
    isShapeDialogOpen,
    setShapeDialogOpen,
    editingShapeNode,
    setEditingShapeNode,
    handleAddShape,
    handleUpdateShape,
  } = useShapeHandler({
    canvasRef,
    updateLayers,
    setSelectedNode,
  });

  const {
    isFrameDialogOpen,
    setFrameDialogOpen,
    editingFrameNode,
    setEditingFrameNode,
    handleAddFrame,
    handleUpdateFrame,
  } = useFrameHandler({
    canvasRef,
    updateLayers,
    setSelectedNode,
  });
  
  const addImageToMask = useCallback((maskGroup: any) => {
      if (!maskGroup || maskGroup.name() !== 'mask' || !canvasRef.current?.layer) return;
      const layer = canvasRef.current.layer;

      const imageFileInput = document.createElement('input');
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
                      // Clear existing content
                      maskGroup.find('.placeholder-icon, .mask-image').forEach((child: any) => child.destroy());
                      
                      const maskWidth = maskGroup.width();
                      const maskHeight = maskGroup.height();
                      const imgWidth = img.width();
                      const imgHeight = img.height();
                      
                      // Scale image to fill mask
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
                      
                      const borderShape = maskGroup.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text');
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
          imageFileInput.value = '';
          document.body.removeChild(imageFileInput);
      };
      imageFileInput.click();
  }, [updateLayers]);
  
  const selectNode = useCallback((node: any) => {
    if (!canvasRef.current?.layer) return;
    const { layer, stage } = canvasRef.current;
    
    // If it's a child of a group, select the group.
    let nodeToSelect = node;
    if (node.parent?.hasName('circularText') || node.parent?.hasName('mask') || node.parent?.hasName('textGroup')) {
      nodeToSelect = node.parent;
    }

    if (nodeToSelect === selectedNode) {
        // If a mask group is already selected, allow re-triggering image add
        if(nodeToSelect.hasName('mask')) {
             addImageToMask(nodeToSelect);
        }
        return;
    }
    
    setSelectedNode(nodeToSelect);
    
    // Image Specific
    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";
    imageFileInput.style.display = 'none';
    document.body.appendChild(imageFileInput);


    // Remove previous listeners to avoid duplicates
    nodeToSelect.off('dblclick dbltap');
    nodeToSelect.on('dblclick dbltap', () => {
         if (nodeToSelect.hasName('text') || nodeToSelect.hasName('circularText') || nodeToSelect.hasName('textGroup')) {
            setEditingTextNode(nodeToSelect);
            setTextDialogOpen(true);
        } else if (nodeToSelect.hasName('shape')) {
          setEditingShapeNode(nodeToSelect);
          setShapeDialogOpen(true);
        } else if (nodeToSelect.hasName('image')) {
            // This logic is for replacing an existing image.
            imageFileInput.onchange = () => {
                if (imageFileInput.files && imageFileInput.files.length > 0) {
                    const file = imageFileInput.files[0];
                    const reader = new FileReader();
                    reader.onloadstart = () => setIsLoading(true);
                    reader.onload = (e) => {
                        window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                            const MAX_WIDTH = stage.width() * 0.8;
                            const MAX_HEIGHT = stage.height() * 0.8;
                            const scale = Math.min(MAX_WIDTH / img.width(), MAX_HEIGHT / img.height(), 1);
                            
                            // Replace the old image with the new one
                            nodeToSelect.destroy();
                            
                            img.setAttrs({
                                x: (stage.width() - img.width() * scale) / 2,
                                y: (stage.height() - img.height() * scale) / 2,
                                scaleX: scale,
                                scaleY: scale,
                                name: 'image',
                                draggable: true,
                            });
                            layer.add(img);
                            selectNode(img); // Reselect the new image
                            updateLayers();
                            layer.draw();
                            setIsLoading(false);
                        });
                    };
                    reader.onerror = () => setIsLoading(false);
                    reader.readAsDataURL(file);
                }
                imageFileInput.value = ''; // Reset input
            };
            imageFileInput.click();
        } else if (nodeToSelect.hasName('frame')) {
            setEditingFrameNode(nodeToSelect);
            setFrameDialogOpen(true);
        } else if (nodeToSelect.hasName('mask')) {
             addImageToMask(nodeToSelect);
        }
    });
    document.body.removeChild(imageFileInput);
  }, [selectedNode, updateLayers, addImageToMask, setTextDialogOpen, setEditingTextNode, setEditingShapeNode, setShapeDialogOpen, setEditingFrameNode, setFrameDialogOpen]);

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
        fill: '#f0f0f0', 
        stroke: config.borderColor,
        strokeWidth: config.borderThickness,
    };

    switch (config.type) {
        case 'circle':
            borderShape = new window.Konva.Circle({ ...commonAttrs, x: size / 2, y: size / 2, radius: size / 2 });
            break;
        case 'star':
            borderShape = new window.Konva.Star({ ...commonAttrs, x: size / 2, y: size / 2, numPoints: 5, innerRadius: size / 4, outerRadius: size / 2 });
            break;
        case 'triangle':
            borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, x: size / 2, y: size / 2, sides: 3, radius: size / 2 });
            break;
        case 'polygon':
            borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, x: size / 2, y: size / 2, sides: config.sides || 6, radius: size / 2 });
            break;
        case 'diamond':
            borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, x: size / 2, y: size / 2, sides: 4, radius: size / (Math.sqrt(2)) });
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
                x: group.width() / 2,
                y: group.height() / 2,
                text: config.letter || 'A',
                fontSize: size,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontStyle: 'bold',
                fill: '#f0f0f0',
                stroke: config.borderColor,
                strokeWidth: config.borderThickness,
                offsetX: textForClip.width() / 2,
                offsetY: textForClip.height() / 2,
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

    group.clipFunc(function (ctx: any) {
        const clipShapeForCtx = borderShape.clone();
        clipShapeForCtx.fill('black'); // clip must be black
        clipShapeForCtx.stroke(null);
        clipShapeForCtx.strokeWidth(0);
        clipShapeForCtx._sceneFunc(ctx);
    });

    layer.add(group);
    updateLayers();
    layer.draw();
    setSelectedNode(group);
    setMaskDialogOpen(false);
    const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    group.setAttr('id', uniqueId);

  }, [updateLayers]);

  const handleUpdateMask = useCallback((attrs: any) => {
    if (!editingMaskNode) return;
    const border = editingMaskNode.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text');
    if (border) {
      if (attrs.borderColor) {
        border.stroke(attrs.borderColor);
      }
      if (attrs.borderThickness) {
        border.strokeWidth(attrs.borderThickness);
      }
       if (attrs.sides && border.getClassName() === 'RegularPolygon') {
        border.sides(attrs.sides);
      }
    }
    canvasRef.current?.layer.draw();
  }, [editingMaskNode]);

  const addImageFromComputer = useCallback(() => {
    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = "image/png, image/jpeg,_jpg, image/gif, image/svg+xml";

    imageFileInput.onchange = () => {
        if (imageFileInput.files && imageFileInput.files.length > 0) {
            const file = imageFileInput.files[0];
            const reader = new FileReader();
            reader.onloadstart = () => setIsLoading(true);
            reader.onload = (e) => {
                window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                    if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
                    const { stage, layer } = canvasRef.current;
                    const MAX_WIDTH = stage.width() * 0.8;
                    const MAX_HEIGHT = stage.height() * 0.8;
                    const scale = Math.min(MAX_WIDTH / img.width(), MAX_HEIGHT / img.height(), 1);

                    img.setAttrs({
                        x: (stage.width() - img.width() * scale) / 2,
                        y: (stage.height() - img.height() * scale) / 2,
                        scaleX: scale,
                        scaleY: scale,
                        name: 'image',
                        draggable: true,
                    });
                    layer.add(img);
                    updateLayers();
                    setSelectedNode(img);
                    layer.draw();
                    setIsLoading(false);
                });
            };
            reader.onerror = () => setIsLoading(false);
            reader.readAsDataURL(file);
        }
        imageFileInput.value = ''; // Reset for next time
    };
    imageFileInput.click();
  }, [updateLayers]);
  
  const handleSelectItem = useCallback((itemType: string) => {
    setAddItemDialogOpen(false);
    deselectNode();

    if (!canvasRef.current) return;

    switch (itemType) {
      case 'text':
        setEditingTextNode(null);
        setTextDialogOpen(true);
        break;
      case 'shape':
        setEditingShapeNode(null);
        setShapeDialogOpen(true);
        break;
      case 'image':
        addImageFromComputer();
        break;
      case 'frame':
        setEditingFrameNode(null);
        setFrameDialogOpen(true);
        break;
      case 'mask':
        setEditingMaskNode(null);
        setMaskDialogOpen(true);
        break;
      default:
        break;
    }
  }, [deselectNode, addImageFromComputer, setTextDialogOpen, setEditingTextNode, setShapeDialogOpen, setEditingShapeNode, setFrameDialogOpen, setEditingFrameNode]);

  const handleMoveNode = useCallback((action: 'up' | 'down', nodeId: string) => {
    if (!canvasRef.current?.layer) return;
    const { layer } = canvasRef.current;

    const node = layer.findOne(`#${nodeId}`);
    if (!node) return;

    if (action === 'up') {
      node.moveUp();
    } else if (action === 'down') {
      // Prevent moving behind the background
      if (node.getZIndex() > 1) {
        node.moveDown();
      }
    }

    // Get the updated children list from Konva itself
    const newChildrenArray = Array.from(layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer'));

    // Force a re-render by setting the new array
    setKonvaObjects(newChildrenArray);

    layer.batchDraw();
  }, []);
  
  
  const handleAlign = useCallback((position: string) => {
    if (!selectedNode || !canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;
    const box = selectedNode.getClientRect();

    let newX, newY;

    switch(position) {
        case 'top':
            newY = selectedNode.y() - box.y;
            selectedNode.y(newY);
            break;
        case 'left':
            newX = selectedNode.x() - box.x;
            selectedNode.x(newX);
            break;
        case 'center':
            newX = selectedNode.x() + (stage.width() / 2 - (box.x + box.width / 2));
            newY = selectedNode.y() + (stage.height() / 2 - (box.y + box.height / 2));
            selectedNode.x(newX);
            selectedNode.y(newY);
            break;
        case 'right':
            newX = selectedNode.x() + (stage.width() - (box.x + box.width));
            selectedNode.x(newX);
            break;
        case 'bottom':
            newY = selectedNode.y() - (box.y + box.height - stage.height());
            selectedNode.y(newY);
            break;
    }
    if (canvasRef.current?.layer) canvasRef.current.layer.draw();
  }, [selectedNode]);
  
  const handleOpacityChange = useCallback((opacity: number) => {
    if (selectedNode) {
      selectedNode.opacity(opacity);
      if (canvasRef.current?.layer) {
        canvasRef.current.layer.draw();
      }
    }
  }, [selectedNode]);

  const handleFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    if (!selectedNode) return;
    const node = selectedNode;

    if (direction === 'horizontal') {
        const scaleX = node.scaleX();
        node.scaleX(-scaleX);
    } else {
        const scaleY = node.scaleY();
        node.scaleY(-scaleY);
    }

    canvasRef.current?.layer.batchDraw();
  }, [selectedNode]);
  
    const handleColorUpdate = useCallback((config: any) => {
        if (!selectedNode) return;

        const nodeType = selectedNode.name();
        const shapeType = selectedNode.getAttr('data-type');
        const isLineOrArrow = shapeType === 'line' || shapeType === 'arrow' || shapeType === 'curve';
        
        selectedNode.setAttrs({
            'data-is-gradient': config.isGradient,
            'data-solid-color': config.solidColor,
            'data-color-stops': config.colorStops,
            'data-gradient-direction': config.gradientDirection,
        });

        if (nodeType === 'shape' && isLineOrArrow) {
            // Lines and arrows only use stroke
            selectedNode.stroke(config.solidColor);
            if (shapeType === 'arrow') {
                selectedNode.fill(config.solidColor); // Arrowhead fill
            }
        } else {
            // All other shapes and text
            applyFill(selectedNode, config);
        }
        
        canvasRef.current?.layer.draw();
    }, [selectedNode, applyFill]);

    useEffect(() => {
        if (canvasRef.current?.background && isCanvasReady) {
          canvasRef.current.background.fill(backgroundColor);
          if (canvasRef.current.layer) {
              canvasRef.current.layer.draw();
          }
        }
    }, [backgroundColor, isCanvasReady]);

  // Handle transformer attachment
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.layer) return;

    const { layer } = canvasRef.current;

    // Destroy previous transformer if it exists
    if (transformerRef.current) {
      transformerRef.current.destroy();
    }

    if (selectedNode) {
      const tr = new window.Konva.Transformer({
        nodes: [selectedNode],
        rotateEnabled: true,
        keepRatio: true,
      });
      layer.add(tr);
      transformerRef.current = tr;
    } 
    layer.batchDraw();
    
    // Cleanup on unmount
    return () => {
      if (transformerRef.current) {
        transformerRef.current.destroy();
      }
    };
  }, [selectedNode, isCanvasReady]);

  const initializeKonva = useCallback(() => {
    if (!canvasRef.current || !canvasRef.current.stage) {
      return;
    }

    const { stage, layer } = canvasRef.current;


    const saveBtn = document.getElementById('save-btn');
    
    if (typeof window.Konva === 'undefined') {
      console.error('Konva library is not loaded. Canvas features are disabled.');
      return;
    }

    try {
      if (!stage) {
        console.error("Stage is not initialized. Cannot proceed.");
        return;
      }
      updateLayers();
      
      saveBtn?.addEventListener('click', () => {
        deselectNode();
        if (!stage) return;
        const dataURL = stage.toDataURL({ mimeType: "image/png", quality: 1 });
        const link = document.createElement('a');
        link.download = 'konva-design.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      stage.on('click tap', (e: any) => {
        if (e.target === stage || e.target.hasName('background')) {
          deselectNode();
          return;
        }

        let targetNode = e.target;
        if (e.target.parent?.hasName('circularText') || e.target.parent?.hasName('textGroup') || e.target.parent?.hasName('mask')) {
            targetNode = e.target.parent;
        }

        selectNode(targetNode);
      });
      
      stage.on('dragend', () => {
        updateLayers();
      });

    } catch (error) {
      console.error("CRITICAL KONVA ERROR: Failed to initialize Konva components (stage/layer).", error);
    }
  }, [updateLayers, deselectNode, selectNode]);
  
  useEffect(() => {
    if ((window as any).Konva && isCanvasReady) {
      initializeKonva();
    }
  }, [isCanvasReady, selectedNode, initializeKonva]);

  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const children = canvasRef.current.layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer');
    const newChildren = Array.from(children || []);
    setKonvaObjects(newChildren);
  }, [selectedNode]);


  const value: CanvasContextType = {
    canvasRef,
    transformerRef,
    konvaObjects,
    setKonvaObjects,
    selectedNode,
    setSelectedNode,
    canvasSize,
    setCanvasSize,
    isCanvasReady,
    setCanvasReady,
    backgroundColor,
    setBackgroundColor,
    isLoading,
    setIsLoading,
    isAddItemDialogOpen,
    setAddItemDialogOpen,
    isShapeDialogOpen,
    setShapeDialogOpen,
    isTextDialogOpen,
    setTextDialogOpen,
    isFrameDialogOpen,
    setFrameDialogOpen,
    isMaskDialogOpen,
    setMaskDialogOpen,
    editingShapeNode,
    setEditingShapeNode,
    editingFrameNode,
    setEditingFrameNode,
    editingMaskNode,
    setEditingMaskNode,
editingTextNode,
    setEditingTextNode,
    updateLayers,
    selectNode,
    deselectNode,
    handleMoveNode,
    handleAlign,
    handleOpacityChange,
    handleFlip,
    handleColorUpdate,
    handleSelectItem,
    addImageFromComputer,
    handleAddShape,
    handleUpdateShape,
    handleAddOrUpdateText,
    handleAddFrame,
    handleUpdateFrame,
    handleAddMask,
    handleUpdateMask,
    addImageToMask,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

    