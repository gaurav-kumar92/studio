
'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useTextHandler } from '@/hooks/useTextHandler';
import { useShapeHandler } from '@/hooks/useShapeHandler';
import { useFrameHandler } from '@/hooks/useFrameHandler';
import { useMaskHandler } from '@/hooks/useMaskHandler';
import { useNodeHandlers } from '@/hooks/useNodeHandlers';
import { useHistory, Command } from '@/hooks/useHistory';
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
  saveState: (command: Omit<Command, 'before' | 'after'>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  handleGroup: () => void;
  handleUngroup: () => void;
  handleDelete: () => void;
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
  
  const { record, undo: historyUndo, redo: historyRedo, canUndo, canRedo, clearHistory } = useHistory();

  const updateLayers = useCallback(() => {
    if (!canvasRef.current?.layer) return;
  
    const children = canvasRef.current.layer.getChildren(
      (node: any) => node.name() !== 'background' && !node.hasName('Transformer')
    );
  
    const childrenArray = Array.from(children);
    setKonvaObjects(childrenArray);
  
    canvasRef.current.layer.draw();
  }, []);

  const saveState = useCallback((command: Omit<Command, 'before' | 'after'>) => {
    if (isRestoringRef.current) return;
    record(command);
  }, [record]);

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

  const restoreNode = (config: any) => {
    if (!canvasRef.current || !window.Konva) return null;
    const { layer } = canvasRef.current;
    const node = window.Konva.Node.create(config);
    attachDoubleClick(node); // attachDoubleClick must be defined before this is called
    layer.add(node);
    return node;
  };

  const undo = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const command = historyUndo();
    if (!command) return;

    isRestoringRef.current = true;
    deselectNodes();

    if (command.type === 'ADD') {
        command.targets.forEach(t => layer.findOne(`#${t.id}`)?.destroy());
    } else if (command.type === 'DELETE') {
        command.targets.forEach(t => restoreNode(t.config));
    } else if (command.type === 'UPDATE' && command.before) {
        command.before.forEach(b => {
          const node = layer.findOne(`#${b.id}`);
          if (node) {
            node.destroy();
          }
          restoreNode(b.config);
        });
    }

    updateLayers();
    isRestoringRef.current = false;
  }, [historyUndo, updateLayers, deselectNodes]);

  const redo = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const command = historyRedo();
    if (!command) return;

    isRestoringRef.current = true;
    deselectNodes();
    
    if (command.type === 'ADD') {
        command.targets.forEach(t => restoreNode(t.config));
    } else if (command.type === 'DELETE') {
        command.targets.forEach(t => layer.findOne(`#${t.id}`)?.destroy());
    } else if (command.type === 'UPDATE' && command.after) {
        command.after.forEach(a => {
            const node = layer.findOne(`#${a.id}`);
            if (node) {
                node.destroy();
            }
            restoreNode(a.config);
        });
    }
    
    updateLayers();
    isRestoringRef.current = false;
  }, [historyRedo, updateLayers, deselectNodes]);

  //** MUST BE DEFINED BEFORE useNodeHandlers because it's a dependency **
  const {
    addImageToMask,
    handleAddMask,
    handleUpdateMask,
  } = useMaskHandler({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    setIsLoading,
    attachDoubleClick: (node) => attachDoubleClick(node), // Pass attachDoubleClick here
    saveState,
    editingMaskNode,
    setEditingMaskNode,
  });

  //** MUST BE DEFINED AFTER the functions it depends on (addImageToMask) **
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

  useSelection({
    isCanvasReady,
    canvasRef,
    isMultiSelectMode,
    selectedNodes,
    setSelectedNodes,
    saveState,
  });
  
  const {
    handleAddOrUpdateText,
  } = useTextHandler({
    canvasRef,
    updateLayers,
    deselectNode: deselectNodes,
    setSelectedNodes,
    applyFill,
    attachDoubleClick: attachDoubleClick,
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
    attachDoubleClick: attachDoubleClick,
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
    attachDoubleClick: attachDoubleClick,
    saveState,
  });

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
                    saveState({ type: 'ADD', targets: [{id: uniqueId, config: img.toObject()}] });
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
    
    const beforeState = [{ id: nodeId, config: node.toObject() }];

    if (action === 'up') {
      node.moveUp();
    } else if (action === 'down') {
      if (node.getZIndex() > 1) {
        node.moveDown();
      }
    }
    const afterState = [{ id: nodeId, config: node.toObject() }];
    
    saveState({ type: 'UPDATE', before: beforeState, after: afterState });
    
    const newChildrenArray = Array.from(layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer'));
    setKonvaObjects(newChildrenArray);
    layer.batchDraw();
  }, [saveState]);
  
  const handleAlign = useCallback((position: string) => {
    if (selectedNodes.length === 0 || !canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;

    const beforeState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));

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
    const afterState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
    saveState({ type: 'UPDATE', before: beforeState, after: afterState });
  }, [selectedNodes, saveState]);
  
  const handleOpacityChange = useCallback((opacity: number) => {
    if (selectedNodes.length === 0) return;
    const beforeState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
    selectedNodes.forEach(node => {
      node.opacity(opacity);
    });
    if (canvasRef.current?.layer) {
      canvasRef.current.layer.draw();
      const afterState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
      saveState({ type: 'UPDATE', before: beforeState, after: afterState });
    }
  }, [selectedNodes, saveState]);

  const handleFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedNodes.length === 0) return;
    const layer = canvasRef.current?.layer;
    if (!layer) return;

    const beforeState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
  
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
    const afterState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
    saveState({ type: 'UPDATE', before: beforeState, after: afterState });
  }, [selectedNodes, saveState]);

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
    }
  }, []);
  
  const handleColorUpdate = useCallback((config: any) => {
      if (selectedNodes.length === 0) return;
      const beforeState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));

      selectedNodes.forEach(node => {
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
        } else {
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
      const afterState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
      saveState({ type: 'UPDATE', before: beforeState, after: afterState });
  }, [selectedNodes, applyFill, applyStroke, canvasRef, saveState]);

  const handleMaskImageZoom = useCallback((direction: 'in' | 'out') => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
      const selectedNode = selectedNodes[0];
      const image = selectedNode.findOne('.mask-image');
      if (!image) return;
  
      const beforeState = [{ id: selectedNode.id(), config: selectedNode.toObject() }];

      const scaleBy = 1.1;
      const oldScale = image.scaleX();
      const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
  
      image.scale({ x: newScale, y: newScale });
      canvasRef.current?.layer.batchDraw();
      const afterState = [{ id: selectedNode.id(), config: selectedNode.toObject() }];
      saveState({ type: 'UPDATE', before: beforeState, after: afterState });
  }, [selectedNodes, saveState]);
  
  const handleMaskImageReset = useCallback(() => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
      const selectedNode = selectedNodes[0];
      const image = selectedNode.findOne('.mask-image');
      if (!image) return;

      const beforeState = [{ id: selectedNode.id(), config: selectedNode.toObject() }];

      const maskWidth = selectedNode.width();
      const maskHeight = selectedNode.height();
      const imgWidth = image.getAttr('data-original-width');
      const imgHeight = image.getAttr('data-original-height');

      if (!imgWidth || !imgHeight) return;

      const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);
      
      image.position({ x: 0, y: 0 });
      image.scale({ x: scale, y: scale });

      canvasRef.current?.layer.batchDraw();
      const afterState = [{ id: selectedNode.id(), config: selectedNode.toObject() }];
      saveState({ type: 'UPDATE', before: beforeState, after: afterState });
  }, [selectedNodes, saveState]);

  const handleMaskImagePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
      const selectedNode = selectedNodes[0];
      const image = selectedNode.findOne('.mask-image');
      if (!image) return;

      const beforeState = [{ id: selectedNode.id(), config: selectedNode.toObject() }];
  
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
      const afterState = [{ id: selectedNode.id(), config: selectedNode.toObject() }];
      saveState({ type: 'UPDATE', before: beforeState, after: afterState });
  }, [selectedNodes, saveState]);

  const handleGroup = useCallback(() => {
    if (selectedNodes.length < 2 || !canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;

    const beforeDeleteState = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedNodes.forEach(node => {
        const box = node.getClientRect({ skipTransform: false });
        minX = Math.min(minX, box.x);
        minY = Math.min(minY, box.y);
        maxX = Math.max(maxX, box.x + box.width);
        maxY = Math.max(maxY, box.y + box.height);
    });

    const groupRect = { x: minX, y: minY };
    
    const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newGroup = new window.Konva.Group({
        id: uniqueId,
        draggable: true,
        name: 'group',
        x: groupRect.x,
        y: groupRect.y,
    });
    
    attachDoubleClick(newGroup);
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

    layer.draw();
    setMultiSelectMode(false);
    setSelectedNodes([newGroup]);

    saveState({ type: 'DELETE', targets: beforeDeleteState });
    saveState({ type: 'ADD', targets: [{ id: uniqueId, config: newGroup.toObject() }] });

    updateLayers();
  }, [selectedNodes, updateLayers, saveState, setMultiSelectMode, setSelectedNodes, attachDoubleClick]);

  const handleUngroup = useCallback(() => {
    if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('group') || !canvasRef.current?.layer) return;
    
    const group = selectedNodes[0];
    const layer = canvasRef.current.layer;
    const children = group.getChildren().slice();
    const nodesToSelect: any[] = [];
    
    const groupConfig = { id: group.id(), config: group.toObject() };
    saveState({ type: 'DELETE', targets: [groupConfig] });

    const childrenConfigs: { id: string, config: any }[] = [];

    children.forEach((child:any) => {
        const childAbsPos = child.getAbsolutePosition(layer);
        child.draggable(true);
        child.moveTo(layer);
        child.position(childAbsPos);
        child.scale(group.scale());
        child.rotation(group.rotation());
        nodesToSelect.push(child);
        childrenConfigs.push({ id: child.id(), config: child.toObject() });
    });
    
    group.destroy();
    layer.draw();
    setMultiSelectMode(true);
    setSelectedNodes(nodesToSelect);

    saveState({ type: 'ADD', targets: childrenConfigs });
    
    updateLayers();
  }, [selectedNodes, updateLayers, saveState, setMultiSelectMode, setSelectedNodes]);

  const handleDelete = useCallback(() => {
    if (selectedNodes.length === 0) return;

    const targets = selectedNodes.map(node => ({ id: node.id(), config: node.toObject() }));
    saveState({ type: 'DELETE', targets });

    selectedNodes.forEach(node => node.destroy());
    
    deselectNodes();
    updateLayers();
  }, [selectedNodes, deselectNodes, updateLayers, saveState]);

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

  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const children = canvasRef.current.layer.getChildren((n: any) => n.name() !== 'background' && !n.hasName('Transformer'));
    const newChildren = Array.from(children || []);
    setKonvaObjects(newChildren);
  }, [selectedNodes]);
  
  useEffect(() => {
    clearHistory();
  }, [canvasSize, clearHistory]);


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
    handleDelete,
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
