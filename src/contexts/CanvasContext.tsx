'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useTextHandler } from '@/hooks/useTextHandler';
import { useShapeHandler } from '@/hooks/useShapeHandler';
import { useFrameHandler } from '@/hooks/useFrameHandler';
import { useMaskHandler } from '@/hooks/useMaskHandler';
import { useNodeHandlers } from '@/hooks/useNodeHandlers';
import { useHistory } from '@/hooks/useHistory';

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
  selectedNodes: any[]; // Changed from selectedNode
  setSelectedNodes: React.Dispatch<React.SetStateAction<any[]>>; // Changed from setSelectedNode
  isMultiSelectMode: boolean;
  setMultiSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
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
  deselectNodes: () => void;
  handleSave: () => void;
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
  handleZoom: (direction: 'in' | 'out') => void;
  handleMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  setInitialScale: React.Dispatch<React.SetStateAction<number>>;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const canvasRef = useRef<{ stage: any; layer: any; background: any; }>(null);
  const transformerRef = useRef<any>(null);
  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]); // Changed to array
  const [isMultiSelectMode, setMultiSelectMode] = useState(false);
  const [canvasSize, setCanvasSize] = useState('842x1191');
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [initialScale, setInitialScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const isRestoringRef = useRef(false);
  const debouncedSaveRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedHistoryRef = useRef(false);
    
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

  const deselectNodes = useCallback(() => {
    setSelectedNodes([]);
  }, []);

  const handleSave = useCallback(() => {
    if (!canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;

    deselectNodes();
    const dataURL = stage.toDataURL({ mimeType: "image/png", quality: 1 });
    const link = document.createElement('a');
    link.download = 'konva-design.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [deselectNodes]);

  const applyFill = useCallback((node: any, config: any) => {
    const targetNodes = (node.hasName('textGroup') || node.hasName('circularText')) 
      ? node.find('.mainChar, .text, Text') 
      : [node];

    targetNodes.forEach((n: any) => {
      n.fill(null);
      n.fillLinearGradientColorStops([]);
      n.fillRadialGradientColorStops([]);
        if (config.isGradient) {
            const { width, height } = n.getClientRect({ relativeTo: n.getParent() });
            const colorStopsFlat = config.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);

            if (config.gradientDirection === 'radial') {
              n.fillPriority('radial-gradient');
              n.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
              n.fillRadialGradientStartRadius(0);
              n.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
              n.fillRadialGradientEndRadius(Math.max(width, height) / 2);
              n.fillRadialGradientColorStops(colorStopsFlat);
          } else {
              n.fillPriority('linear-gradient');
              let start = { x: 0, y: 0 };
              let end = { x: 0, y: 0 };

              switch (config.gradientDirection) {
                  case 'top-to-bottom': end = { x: 0, y: height }; break;
                  case 'left-to-right': end = { x: width, y: 0 }; break;
                  case 'diagonal-tl-br': end = { x: width, y: height }; break;
                  case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
              }
              n.fillLinearGradientStartPoint(start);
              n.fillLinearGradientEndPoint(end);
              n.fillLinearGradientColorStops(colorStopsFlat);
          }
      } else {
          n.fillPriority('color');
          n.fill(config.solidColor);
      }
  });
}, []);

  const serializeCanvas = useCallback(() => {
    if (!canvasRef.current?.layer) return '';
    const { layer } = canvasRef.current;

    const childrenConfigs = layer.getChildren()
        .filter((node: any) => node.name() !== 'background' && node.className !== 'Transformer')
        .map((node: any) => node.toObject());
    
    return JSON.stringify(childrenConfigs);
  }, []);

  const restoreKonvaState = useCallback((savedStateJson: string) => {
    if (!canvasRef.current?.layer || !window.Konva) return;
    const { layer } = canvasRef.current;
    
    console.log('Restoring state:', savedStateJson.substring(0, 100) + '...');
    
    isRestoringRef.current = true;
    
    layer.getChildren((node: any) => node.name() !== 'background' && node.className !== 'Transformer').forEach((node: any) => node.destroy());
    
    try {
        const savedConfigs = JSON.parse(savedStateJson);
        
        console.log('Restoring', savedConfigs.length, 'nodes');

        savedConfigs.forEach((config: any) => {
            const node = window.Konva.Node.create(config, layer);
            if (node && node.className !== 'Transformer' && node.name() !== 'background') {
                attachDoubleClick(node); 
            }
        });

        const newChildren = Array.from(layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer'));
        setKonvaObjects(newChildren);
        setSelectedNodes([]);
        layer.batchDraw();
    } catch (e) {
        console.error("Failed to restore Konva state from history", e);
    } finally {
        isRestoringRef.current = false;
    }
  }, [setKonvaObjects]);

  const { 
    history, 
    currentStep, 
    saveState: historySaveState,
    undo: historyUndo,
    redo: historyRedo,
    canUndo,
    canRedo,
  } = useHistory();

  const saveState = useCallback(() => {
    if (isRestoringRef.current) {
      console.log('Skipping save - currently restoring');
      return;
    }
    
    const state = serializeCanvas();
    console.log('Saving state:', state.substring(0, 100) + '...');
    historySaveState(state);
  }, [serializeCanvas, historySaveState]);

  const scheduleSave = useCallback(() => {
    if (isRestoringRef.current) return;
    
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    
    debouncedSaveRef.current = setTimeout(() => {
      saveState();
    }, 500);
  }, [saveState]);

  const {
    isTextDialogOpen,
    setTextDialogOpen,
    editingTextNode,
    setEditingTextNode,
    handleAddOrUpdateText,
  } = useTextHandler({
    canvasRef,
    updateLayers,
    deselectNode: deselectNodes,
    setSelectedNode: (node) => setSelectedNodes([node]),
    applyFill,
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
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
    setSelectedNode: (node) => setSelectedNodes([node]),
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
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
    setSelectedNode: (node) => setSelectedNodes([node]),
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
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
    setSelectedNode: (node) => setSelectedNodes([node]),
    setIsLoading,
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
  });

  const { handleDoubleClick, attachDoubleClick } = useNodeHandlers({
    setEditingTextNode,
    setTextDialogOpen,
    setEditingShapeNode,
    setShapeDialogOpen,
    setEditingFrameNode,
    setFrameDialogOpen,
    addImageToMask,
    setIsLoading,
  });

  const undo = useCallback(() => {
    console.log('Undo clicked, currentStep:', currentStep, 'history length:', history.length);
    const savedState = historyUndo();
    console.log('Retrieved state for undo:', savedState ? savedState.substring(0, 100) + '...' : 'null');
    if (savedState) {
        restoreKonvaState(savedState);
    }
  }, [historyUndo, restoreKonvaState, currentStep, history]);

  const redo = useCallback(() => {
    console.log('Redo clicked, currentStep:', currentStep, 'history length:', history.length);
    const savedState = historyRedo();
    console.log('Retrieved state for redo:', savedState ? savedState.substring(0, 100) + '...' : 'null');
    if (savedState) {
        restoreKonvaState(savedState);
    }
  }, [historyRedo, restoreKonvaState, currentStep, history]);

  const selectNode = useCallback((node: any) => {
    if (!canvasRef.current?.layer) return;
  
    let nodeToSelect = node;
    if (
      node.parent?.hasName('circularText') ||
      node.parent?.hasName('mask') ||
      node.parent?.hasName('textGroup') ||
      node.parent?.hasName('group')
    ) {
      nodeToSelect = node.parent;
    }
  
    if (isMultiSelectMode) {
      const isSelected = selectedNodes.some(n => n.id() === nodeToSelect.id());
      if (isSelected) {
        setSelectedNodes(prev => prev.filter(n => n.id() !== nodeToSelect.id()));
      } else {
        setSelectedNodes(prev => [...prev, nodeToSelect]);
      }
    } else {
      setSelectedNodes([nodeToSelect]);
    }
  }, [isMultiSelectMode, selectedNodes]);

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
                    attachDoubleClick(img);
                    layer.add(img);
                    updateLayers();
                    selectNode(img);
                    layer.draw();
                    setIsLoading(false);
                    saveState();
                });
            };
            reader.onerror = () => setIsLoading(false);
            reader.readAsDataURL(file);
        }
        imageFileInput.value = '';
    };
    imageFileInput.click();
  }, [updateLayers, setIsLoading, selectNode, attachDoubleClick, saveState]);

  const handleSelectItem = useCallback((itemType: string) => {
    setAddItemDialogOpen(false);
    deselectNodes();

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
  }, [deselectNodes, addImageFromComputer, setTextDialogOpen, setEditingTextNode, setShapeDialogOpen, setEditingShapeNode, setFrameDialogOpen, setEditingFrameNode, setMaskDialogOpen]);

  const handleMoveNode = useCallback((action: 'up' | 'down', nodeId: string) => {
    if (!canvasRef.current?.layer) return;
    const { layer } = canvasRef.current;

    const node = layer.findOne(`#${nodeId}`);
    if (!node) return;

    if (action === 'up') {
      node.moveUp();
    } else if (action === 'down') {
      if (node.getZIndex() > 1) {
        node.moveDown();
      }
    }

    const newChildrenArray = Array.from(layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer'));
    setKonvaObjects(newChildrenArray);
    layer.batchDraw();
    saveState();
  }, [saveState]);
  

  const handleAlign = useCallback((position: string) => {
    if (selectedNodes.length === 0 || !canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;

    selectedNodes.forEach(node => {
      const box = node.getClientRect();
      let newX, newY;

      switch(position) {
          case 'top':
              newY = node.y() - box.y;
              node.y(newY);
              break;
          case 'left':
              newX = node.x() - box.x;
              node.x(newX);
              break;
          case 'center':
              newX = node.x() + (stage.width() / 2 - (box.x + box.width / 2));
              newY = node.y() + (stage.height() / 2 - (box.y + box.height / 2));
              node.x(newX);
              node.y(newY);
              break;
          case 'right':
              newX = node.x() + (stage.width() - (box.x + box.width));
              node.x(newX);
              break;
          case 'bottom':
              newY = node.y() - (box.y + box.height - stage.height());
              node.y(newY);
              break;
      }
    });
    
    if (canvasRef.current?.layer) canvasRef.current.layer.draw();
    scheduleSave();
  }, [selectedNodes, scheduleSave]);
  
  const handleOpacityChange = useCallback((opacity: number) => {
    selectedNodes.forEach(node => {
      node.opacity(opacity);
    });
    if (canvasRef.current?.layer) {
      canvasRef.current.layer.draw();
      scheduleSave();
    }
  }, [selectedNodes, scheduleSave]);

  const handleFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedNodes.length === 0) return;
    const layer = canvasRef.current?.layer;
    if (!layer) return;
  
    selectedNodes.forEach(node => {
      const width = node.width();
      const height = node.height();
    
      if (node.offsetX() !== width / 2 || node.offsetY() !== height / 2) {
        const oldCenterX = node.x() + (width / 2 - node.offsetX()) * node.scaleX();
        const oldCenterY = node.y() + (height / 2 - node.offsetY()) * node.scaleY();
        
        node.offset({
          x: width / 2,
          y: height / 2,
        });
        
        node.position({
          x: oldCenterX,
          y: oldCenterY,
        });
      }
    
      if (direction === 'horizontal') {
        node.scaleX(node.scaleX() * -1);
      } else {
        node.scaleY(node.scaleY() * -1);
      }
    });
  
    layer.batchDraw();
    scheduleSave();
  }, [selectedNodes, scheduleSave]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();

    let newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
    if (direction === 'out' && newScale < initialScale) {
      newScale = initialScale;
    }
    
    const [originalWidth, originalHeight] = canvasSize.split('x').map(Number);
    const PIXELS_PER_POINT = 0.35;
    const unscaledWidth = originalWidth * PIXELS_PER_POINT;
    const unscaledHeight = originalHeight * PIXELS_PER_POINT;
    
    stage.width(unscaledWidth * newScale);
    stage.height(unscaledHeight * newScale);
    stage.scale({ x: newScale, y: newScale });
    stage.draw();
  }, [initialScale, canvasSize]);

  const applyStroke = useCallback((node: any, config: any) => {
    if (config.isGradient) {
        const { width, height } = node.getClientRect({ relativeTo: node.getParent() });
        const colorStopsFlat = config.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);
        
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };

        switch (config.gradientDirection) {
            case 'left-to-right': 
                end = { x: width, y: 0 }; 
                break;
            case 'diagonal-tl-br': 
                end = { x: width, y: height }; 
                break;
            case 'diagonal-tr-bl': 
                start = { x: width, y: 0 }; 
                end = { x: 0, y: height }; 
                break;
            case 'radial':
            case 'top-to-bottom':
            default:
                end = { x: 0, y: height }; 
                break;
        }

        node.strokeLinearGradientStartPoint(start);
        node.strokeLinearGradientEndPoint(end);
        node.strokeLinearGradientColorStops(colorStopsFlat);
        
        node.setAttr('data-is-gradient', true);
        node.setAttr('data-gradient-direction', config.gradientDirection);
        node.setAttr('data-color-stops', config.colorStops);
    } else {
        let solidColor = config.solidColor || node.getAttr('data-solid-color') || '#3b82f6';
        
        node.strokeLinearGradientStartPoint({ x: 0, y: 0 });
        node.strokeLinearGradientEndPoint({ x: 0, y: 0 });
        node.strokeLinearGradientColorStops(null);
        
        node.stroke(solidColor);
        
        node.setAttr('data-is-gradient', false);
        node.setAttr('data-solid-color', solidColor);
    }
    
    const layer = node.getLayer();
    if (layer) {
        layer.draw();
        scheduleSave();
    }
  }, [scheduleSave]);
  
  const handleColorUpdate = useCallback((config: any) => {
      if (selectedNodes.length === 0) return;

      selectedNodes.forEach(node => {
        const nodeType = node.name();
        const shapeType = node.getAttr('data-type');
        const usesStroke = (nodeType === 'shape' && (shapeType === 'line' || shapeType === 'arrow' || shapeType === 'curve')) || nodeType === 'frame';
        
        node.setAttrs({
            'data-is-gradient': config.isGradient,
            'data-solid-color': config.solidColor,
            'data-color-stops': config.colorStops,
            'data-gradient-direction': config.gradientDirection,
        });
        
        if (usesStroke) {
          applyStroke(node, config);
        } else {
          applyFill(node, config);
        }
      });
    
      canvasRef.current?.layer.draw();
      scheduleSave();
  }, [selectedNodes, applyFill, applyStroke, canvasRef, scheduleSave]);

  const handleMaskImageZoom = useCallback((direction: 'in' | 'out') => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
      const selectedNode = selectedNodes[0];
      const image = selectedNode.findOne('.mask-image');
      if (!image) return;
  
      const scaleBy = 1.1;
      const oldScale = image.scaleX();
      const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
  
      image.scale({ x: newScale, y: newScale });
      canvasRef.current?.layer.batchDraw();
      scheduleSave();
  }, [selectedNodes, scheduleSave]);
  
  const handleMaskImageReset = useCallback(() => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
      const selectedNode = selectedNodes[0];
      const image = selectedNode.findOne('.mask-image');
      if (!image) return;

      const maskWidth = selectedNode.width();
      const maskHeight = selectedNode.height();
      const imgWidth = image.getAttr('data-original-width');
      const imgHeight = image.getAttr('data-original-height');

      if (!imgWidth || !imgHeight) return;

      const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);
      
      image.position({ x: 0, y: 0 });
      image.scale({ x: scale, y: scale });

      canvasRef.current?.layer.batchDraw();
      scheduleSave();
  }, [selectedNodes, scheduleSave]);

  const handleMaskImagePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
      const selectedNode = selectedNodes[0];
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
  
      const boundFunc = image.getAttr('dragBoundFunc');
      if (boundFunc) {
          newPos = boundFunc.call(image, newPos);
      }
  
      image.position(newPos);
      canvasRef.current?.layer.batchDraw();
      scheduleSave();
  }, [selectedNodes, scheduleSave]);

  useEffect(() => {
      if (canvasRef.current?.background && isCanvasReady) {
        canvasRef.current.background.fill(backgroundColor);
        if (canvasRef.current.layer) {
            canvasRef.current.layer.draw();
        }
      }
  }, [backgroundColor, isCanvasReady]);

  // Handle transformer attachment for multi-select
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.layer) return;
  
    const { layer } = canvasRef.current;
  
    if (transformerRef.current) {
      transformerRef.current.destroy();
    }
  
    if (selectedNodes.length > 0) {
      const tr = new window.Konva.Transformer({
        nodes: selectedNodes,
        rotateEnabled: true,
        keepRatio: false, // Allow independent scaling when multiple nodes
        boundBoxFunc: (oldBox: any, newBox: any) => {
          // Prevent scaling to negative or too small
          if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
            return oldBox;
          }
          return newBox;
        },
      });
  
      layer.add(tr);
      transformerRef.current = tr;
    } 
    layer.batchDraw();
    
    return () => {
      if (transformerRef.current) {
        transformerRef.current.destroy();
      }
    };
  }, [selectedNodes, isCanvasReady]);
  

  const initializeKonva = useCallback(() => {
    if (!canvasRef.current || !canvasRef.current.stage) {
      return;
    }

    const { stage } = canvasRef.current;
    
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

      stage.on('click tap', (e: any) => {
        if (window.isOpeningFileDialog) {
          window.isOpeningFileDialog = false;
          return;
        }

        if (e.target === stage || e.target.hasName('background')) {
          if (!isMultiSelectMode) {
            deselectNodes();
          }
          return;
        }

        let targetNode = e.target;
        if (targetNode.parent?.hasName('circularText') || 
            targetNode.parent?.hasName('mask') || 
            targetNode.parent?.hasName('textGroup') ||
            targetNode.parent?.hasName('group')) {
            targetNode = targetNode.parent;
        }

        selectNode(targetNode);
      });
      
      stage.on('dragend', () => {
        updateLayers();
        scheduleSave();
      });
      
      // Initialize history ONLY ONCE when canvas is first ready
      if (!hasInitializedHistoryRef.current) {
        hasInitializedHistoryRef.current = true;
        setTimeout(() => {
          console.log('Initializing history with empty canvas');
          saveState();
        }, 100);
      }

    } catch (error) {
      console.error("CRITICAL KONVA ERROR: Failed to initialize Konva components (stage/layer).", error);
    }
  }, [updateLayers, deselectNodes, selectNode, handleDoubleClick, scheduleSave, saveState, isMultiSelectMode]);
  
  useEffect(() => {
    if ((window as any).Konva && isCanvasReady) {
      initializeKonva();
    }
  }, [isCanvasReady, initializeKonva]);

  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const children = canvasRef.current.layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer');
    const newChildren = Array.from(children || []);
    setKonvaObjects(newChildren);
  }, [selectedNodes]);

  const value: CanvasContextType = {
    canvasRef,
    transformerRef,
    konvaObjects,
    setKonvaObjects,
    selectedNodes,
    setSelectedNodes,
    isMultiSelectMode,
    setMultiSelectMode,
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
    deselectNodes,
    handleSave,
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
    handleZoom,
    setInitialScale,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
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