
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useTextHandler } from '@/hooks/useTextHandler';
import { useShapeHandler } from '@/hooks/useShapeHandler';
import { useFrameHandler } from '@/hooks/useFrameHandler';
import { useMaskHandler } from '@/hooks/useMaskHandler';
import { useNodeHandlers } from '@/hooks/useNodeHandlers';
import { useHistory } from '@/hooks/useHistory';
import { useSelection } from '@/hooks/useSelection';

declare global {
  interface Window {
    Konva: any;
    isOpeningFileDialog?: boolean;
  }
}

type CanvasContextType = {
  canvasRef: React.RefObject<{ stage: any; layer: any; background: any; }>;
  konvaObjects: any[];
  setKonvaObjects: React.Dispatch<React.SetStateAction<any[]>>;
  selectedNodes: any[];
  setSelectedNodes: React.Dispatch<React.SetStateAction<any[]>>;
  isMultiSelectMode: boolean;
  setMultiSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
  canvasSize: string;
  setCanvasSize: React.Dispatch<React.SetStateAction<string>>;
  isCanvasReady: boolean;
  setCanvasReady: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundColor: any;
  setBackgroundColor: React.Dispatch<React.SetStateAction<any>>;
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
  handleGroup: () => void;
  handleUngroup: () => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const canvasRef = useRef<{ stage: any; layer: any; background: any; }>(null);
  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [isMultiSelectMode, setMultiSelectMode] = useState(false);
  const [canvasSize, setCanvasSize] = useState('842x1191');
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<any>({
    isGradient: false,
    solidColor: '#ffffff',
    gradientDirection: 'top-to-bottom',
    colorStops: [
      { id: 0, stop: 0, color: '#3b82f6' },
      { id: 1, stop: 1, color: '#a855f7' },
    ],
  });
  
  const [initialScale, setInitialScale] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const isRestoringRef = useRef(false);
  const debouncedSaveRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedHistoryRef = useRef(false);
    
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);

  // DIALOG STATE MUST BE DECLARED BEFORE HOOKS THAT USE THEM
  const [isTextDialogOpen, setTextDialogOpen] = useState(false);
  const [editingTextNode, setEditingTextNode] = useState<any>(null);
  const [isShapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [editingShapeNode, setEditingShapeNode] = useState<any>(null);
  const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
  const [editingFrameNode, setEditingFrameNode] = useState<any>(null);
  const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
  const [editingMaskNode, setEditingMaskNode] = useState<any>(null);
  
  const updateLayers = useCallback(() => {
    if (!canvasRef.current?.layer) return;
  
    const children = canvasRef.current.layer.getChildren(
      (node: any) => node.name() !== 'background' && !node.hasName('Transformer')
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
        .filter((node: any) => node.name() !== 'background' && !node.hasName('Transformer'))
        .map((node: any) => node.toObject());
    
    return JSON.stringify(childrenConfigs);
  }, []);

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
      return;
    }
    
    const state = serializeCanvas();
    historySaveState(state);
  }, [serializeCanvas, historySaveState]);

  const {
    addImageToMask,
    handleAddMask,
    handleUpdateMask,
  } = useMaskHandler({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    setIsLoading,
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
    editingMaskNode,
    setEditingMaskNode,
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
  
  const restoreKonvaState = useCallback((savedStateJson: string) => {
    if (!canvasRef.current?.layer || !window.Konva) return;
    const { layer } = canvasRef.current;
    
    isRestoringRef.current = true;
    
    layer.getChildren((node: any) => node.name() !== 'background' && node.className !== 'Transformer').forEach((node: any) => node.destroy());
    
    try {
        const savedConfigs = JSON.parse(savedStateJson);
        
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
  }, [setKonvaObjects, setSelectedNodes, attachDoubleClick]);

  const scheduleSave = useCallback(() => {
    if (isRestoringRef.current) return;
    
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    
    debouncedSaveRef.current = setTimeout(() => {
      saveState();
    }, 500);
  }, [saveState]);

  useSelection({
    isCanvasReady,
    canvasRef,
    isMultiSelectMode,
    selectedNodes,
    setSelectedNodes,
    saveState,
    attachDoubleClick,
  });

  const {
    handleAddOrUpdateText,
  } = useTextHandler({
    canvasRef,
    updateLayers,
    deselectNode: deselectNodes,
    setSelectedNodes,
    applyFill,
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
    editingTextNode,
    setEditingTextNode,
    setTextDialogOpen,
  });
  

  const {
    handleAddShape,
    handleUpdateShape,
  } = useShapeHandler({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
    editingShapeNode,
    setEditingShapeNode,
  });

  const {
    handleAddFrame,
    handleUpdateFrame,
  } = useFrameHandler({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick: (node) => attachDoubleClick(node),
    saveState,
  });

  const undo = useCallback(() => {
    const savedState = historyUndo();
    if (savedState) {
        restoreKonvaState(savedState);
    }
  }, [historyUndo, restoreKonvaState]);

  const redo = useCallback(() => {
    const savedState = historyRedo();
    if (savedState) {
        restoreKonvaState(savedState);
    }
  }, [historyRedo, restoreKonvaState]);

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
                    const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                    img.setAttrs({
                        id: uniqueId,
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
                    setSelectedNodes([img]);
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
  }, [updateLayers, setIsLoading, setSelectedNodes, attachDoubleClick, saveState]);

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
  }, [deselectNodes, addImageFromComputer, setTextDialogOpen, setEditingTextNode, setShapeDialogOpen, setEditingShapeNode, setFrameDialogOpen, setEditingFrameNode, setMaskDialogOpen, setEditingMaskNode]);

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
    if (selectedNodes.length === 0) return;
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
      const box = node.getClientRect();
      const visualCenterX = box.x + box.width / 2;
      const visualCenterY = box.y + box.height / 2;
      
      if (direction === 'horizontal') {
        node.scaleX(node.scaleX() * -1);
      } else {
        node.scaleY(node.scaleY() * -1);
      }
      
      const newBox = node.getClientRect();
      const newVisualCenterX = newBox.x + newBox.width / 2;
      const newVisualCenterY = newBox.y + newBox.height / 2;
      
      const deltaX = visualCenterX - newVisualCenterX;
      const deltaY = visualCenterY - newVisualCenterY;
      
      node.x(node.x() + deltaX);
      node.y(node.y() + deltaY);
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
        // If it's a group, apply to children
        if (node.hasName('group')) {
          node.find('*').forEach((child: any) => {
            const childUsesStroke = (child.name() === 'shape' && (child.getAttr('data-type') === 'line' || child.getAttr('data-type') === 'arrow' || child.getAttr('data-type') === 'curve')) || child.name() === 'frame';
            child.setAttrs({
                'data-is-gradient': config.isGradient,
                'data-solid-color': config.solidColor,
                'data-color-stops': config.colorStops,
                'data-gradient-direction': config.gradientDirection,
            });
            if (childUsesStroke) {
              applyStroke(child, config);
            } else {
              applyFill(child, config);
            }
          });
        } else { // Apply to the node itself
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

  const handleGroup = useCallback(() => {
    if (selectedNodes.length < 2 || !canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;

    // Manually calculate bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodes.forEach(node => {
        const box = node.getClientRect();
        minX = Math.min(minX, box.x);
        minY = Math.min(minY, box.y);
        maxX = Math.max(maxX, box.x + box.width);
        maxY = Math.max(maxY, box.y + box.height);
    });

    const groupRect = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
    
    const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newGroup = new window.Konva.Group({
        id: uniqueId,
        draggable: true,
        name: 'group',
        x: groupRect.x,
        y: groupRect.y,
    });
    
    layer.add(newGroup);

    selectedNodes.forEach(node => {
        const nodeAbsPos = node.getAbsolutePosition();
        node.draggable(false);
        node.moveTo(newGroup);
        node.position({
            x: nodeAbsPos.x - groupRect.x,
            y: nodeAbsPos.y - groupRect.y,
        });
    });

    // Attach double click AFTER adding to layer and setting up children
    attachDoubleClick(newGroup);

    layer.draw();
    setMultiSelectMode(false);
    setSelectedNodes([newGroup]); // Select the new group
    updateLayers();
    saveState();
  }, [selectedNodes, updateLayers, saveState, setMultiSelectMode, setSelectedNodes, attachDoubleClick]);


  const handleUngroup = useCallback(() => {
    if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('group') || !canvasRef.current?.layer) return;
    
    const group = selectedNodes[0];
    const layer = canvasRef.current.layer;
    const children = group.getChildren().slice();
    const nodesToSelect: any[] = [];

    children.forEach((child:any) => {
        const childAbsPos = child.getAbsolutePosition(layer);
        child.draggable(true);
        child.moveTo(layer);
        child.position(childAbsPos);
        child.scale(group.scale());
        child.rotation(group.rotation());
        nodesToSelect.push(child);
    });
    
    group.destroy();
    layer.draw();
    setMultiSelectMode(true);
    setSelectedNodes(nodesToSelect);
    updateLayers();
    saveState();
  }, [selectedNodes, updateLayers, saveState, setMultiSelectMode, setSelectedNodes]);

  useEffect(() => {
      if (canvasRef.current?.background && isCanvasReady) {
        const backgroundRect = canvasRef.current.background;
        const layer = canvasRef.current.layer;

        backgroundRect.fill(null);
        backgroundRect.fillLinearGradientColorStops(null);
        backgroundRect.fillRadialGradientColorStops(null);
    
        if (backgroundColor.isGradient) {
            const { width, height } = backgroundRect.getClientRect();
            const colorStopsFlat = backgroundColor.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);
    
            if (backgroundColor.gradientDirection === 'radial') {
                backgroundRect.fillPriority('radial-gradient');
                backgroundRect.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
                backgroundRect.fillRadialGradientStartRadius(0);
                backgroundRect.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
                backgroundRect.fillRadialGradientEndRadius(Math.max(width, height) / 2);
                backgroundRect.fillRadialGradientColorStops(colorStopsFlat);
            } else {
                backgroundRect.fillPriority('linear-gradient');
                let start = { x: 0, y: 0 };
                let end = { x: 0, y: 0 };
    
                switch (backgroundColor.gradientDirection) {
                    case 'top-to-bottom': end = { x: 0, y: height }; break;
                    case 'left-to-right': end = { x: width, y: 0 }; break;
                    case 'diagonal-tl-br': end = { x: width, y: height }; break;
                    case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
                }
                backgroundRect.fillLinearGradientStartPoint(start);
                backgroundRect.fillLinearGradientEndPoint(end);
                backgroundRect.fillLinearGradientColorStops(colorStopsFlat);
            }
        } else {
            backgroundRect.fillPriority('color');
            backgroundRect.fill(backgroundColor.solidColor);
        }
    
        if (layer) {
            layer.draw();
        }
      }
  }, [backgroundColor, isCanvasReady]);

  const initializeKonva = useCallback(() => {
    if (!canvasRef.current || !canvasRef.current.stage || !canvasRef.current.layer) {
      return;
    }
    const { stage } = canvasRef.current;
    if (typeof window.Konva === 'undefined') return;
    try {
      if (!stage) return;
      updateLayers();
      stage.on('dragend', () => {
        updateLayers();
        scheduleSave();
      });
      if (!hasInitializedHistoryRef.current) {
        hasInitializedHistoryRef.current = true;
        setTimeout(() => saveState(), 100);
      }
    } catch (error) {
      console.error("CRITICAL KONVA ERROR: Failed to initialize Konva components.", error);
    }
  }, [updateLayers, scheduleSave, saveState]);
  
  useEffect(() => {
    if ((window as any).Konva && isCanvasReady) {
      initializeKonva();
    }
  }, [isCanvasReady, initializeKonva]);

  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const children = canvasRef.current.layer.getChildren((n: any) => n.name() !== 'background' && !n.hasName('Transformer'));
    const newChildren = Array.from(children || []);
    setKonvaObjects(newChildren);
  }, [selectedNodes]);

  const value: CanvasContextType = {
    canvasRef,
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
    handleGroup,
    handleUngroup,
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
