

'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useTextHandler } from '@/hooks/useTextHandler';
import { useShapeHandler } from '@/hooks/useShapeHandler';
import { useFrameHandler } from '@/hooks/useFrameHandler';
import { useMaskHandler } from '@/hooks/useMaskHandler';
import { useNodeHandlers } from '@/hooks/useNodeHandlers';


// This is a global declaration for the Konva object.
declare global {
  interface Window {
    Konva: any;
    isOpeningFileDialog?: boolean;
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
  handleMaskImageZoom: (direction: 'in' | 'out') => void;
  handleMaskImageReset: () => void;
  handleMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
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
    if (selectedNode) {
      selectedNode.off('dblclick.select dbltap.select');
    }
    setSelectedNode(null);
  }, [selectedNode]);

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

  const {
    isMaskDialogOpen,
    setMaskDialogOpen,
    editingMaskNode,
    setEditingMaskNode,
    handleAddMask,
    handleUpdateMask,
    addImageToMask,
  } = useMaskHandler({
    canvasRef,
    updateLayers,
    setSelectedNode,
    setIsLoading,
  });

  const { handleDoubleClick } = useNodeHandlers({
    setEditingTextNode,
    setTextDialogOpen,
    setEditingShapeNode,
    setShapeDialogOpen,
    setEditingFrameNode,
    setFrameDialogOpen,
    addImageToMask,
    setIsLoading
  });
  
  const selectNode = useCallback((node: any) => {
    if (!canvasRef.current?.layer) return;
  
    // If it's a child of a group, select the group.
    let nodeToSelect = node;
    if (node.parent?.hasName('circularText') || node.parent?.hasName('mask') || node.parent?.hasName('textGroup')) {
        nodeToSelect = node.parent;
    }
  
    if (selectedNode) {
      selectedNode.off('dblclick.select dbltap.select');
    }
  
    setSelectedNode(nodeToSelect);
  
    // Attach new double-click listener with a namespace
    nodeToSelect.on('dblclick.select dbltap.select', () => {
        handleDoubleClick(nodeToSelect);
    });
  }, [selectedNode, setSelectedNode, handleDoubleClick]);

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
                    selectNode(img);
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
  }, [updateLayers, setIsLoading, selectNode]);
  
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
  }, [deselectNode, addImageFromComputer, setTextDialogOpen, setEditingTextNode, setShapeDialogOpen, setEditingShapeNode, setFrameDialogOpen, setEditingFrameNode, setMaskDialogOpen, setEditingMaskNode]);

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
    const layer = canvasRef.current?.layer;
    if (!layer) return;

    // Use getClientRect to get dimensions, which works for all node types
    const rect = node.getClientRect({ skipTransform: true });
    
    // The center of the untransformed shape
    const center = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    };
    
    // Set the offset to the node's center
    node.offset({
        x: center.x,
        y: center.y,
    });
    
    // Move the node to its absolute center position
    node.position({
        x: center.x,
        y: center.y,
    });

    // Apply the flip
    if (direction === 'horizontal') {
      node.scaleX(-node.scaleX());
    } else {
      node.scaleY(-node.scaleY());
    }
  
    layer.batchDraw();
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

    const handleMaskImageZoom = useCallback((direction: 'in' | 'out') => {
        if (!selectedNode || !selectedNode.hasName('mask')) return;
        const image = selectedNode.findOne('.mask-image');
        if (!image) return;
    
        const scaleBy = 1.1;
        const oldScale = image.scaleX();
        const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
    
        image.scale({ x: newScale, y: newScale });
        canvasRef.current?.layer.batchDraw();
      }, [selectedNode]);
    
      const handleMaskImageReset = useCallback(() => {
        if (!selectedNode || !selectedNode.hasName('mask')) return;
        const image = selectedNode.findOne('.mask-image');
        if (!image) return;
  
        const maskWidth = selectedNode.width();
        const maskHeight = selectedNode.height();
        const imgWidth = image.getAttr('data-original-width');
        const imgHeight = image.getAttr('data-original-height');
  
        if (!imgWidth || !imgHeight) return; // Cannot reset if original dimensions are unknown
  
        const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);
        
        image.position({ x: 0, y: 0 });
        image.scale({ x: scale, y: scale });
  
        canvasRef.current?.layer.batchDraw();
      }, [selectedNode]);
  
      const handleMaskImagePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (!selectedNode || !selectedNode.hasName('mask')) return;
        const image = selectedNode.findOne('.mask-image');
        if (!image) return;
    
        const panAmount = 10;
        const currentPos = image.position();
        let newPos = { ...currentPos };
    
        switch (direction) {
          case 'up': newPos.y -= panAmount; break;
          case 'down': newPos.y += panAmount; break;
          case 'left': newPos.x -= panAmount; break;
          case 'right': newPos.x += panAmount; break;
        }
    
        // Use the dragBoundFunc to constrain the new position
        const boundFunc = image.getAttr('dragBoundFunc');
        if (boundFunc) {
            newPos = boundFunc.call(image, newPos);
        }
    
        image.position(newPos);
        canvasRef.current?.layer.batchDraw();
      }, [selectedNode]);

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
        if (window.isOpeningFileDialog) {
          return;
        }

        if (e.target === stage || e.target.hasName('background')) {
          deselectNode();
          return;
        }

        let targetNode = e.target;
        if (e.target.parent?.hasName('circularText') || e.target.parent?.hasName('mask') || e.target.parent?.hasName('textGroup')) {
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
    handleMaskImageZoom,
    handleMaskImageReset,
    handleMaskImagePan,
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

    

    

    