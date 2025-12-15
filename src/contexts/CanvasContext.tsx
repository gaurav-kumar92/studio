
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useTextHandler } from '@/hooks/useTextHandler';
import { useShapeHandler } from '@/hooks/useShapeHandler';
import { useFrameHandler } from '@/hooks/useFrameHandler';
import { useMaskHandler } from '@/hooks/useMaskHandler';
import { useClipartHandler } from '@/hooks/useClipartHandler';
import { useIconHandler } from '@/hooks/useIconHandler';
import { useNodeHandlers } from '@/hooks/useNodeHandlers';
import { useSelection } from '@/hooks/useSelection';
import { useCanvasChangeTracker } from '@/hooks/useCanvasChangeTracker';
import { useLockHandler } from '@/hooks/useLockHandler';
import { useAnimationHandler } from '@/hooks/useAnimationHandler';
import { Node } from 'konva/lib/Node';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useZoomPan } from "@/hooks/useZoomPan";
import { useBackground } from "@/hooks/useBackground";
import { useTransforms } from "@/hooks/useTransforms";
import { useClipboard } from '@/hooks/useClipboard';




declare global {
  interface Window {
    Konva: any;
    isOpeningFileDialog?: boolean;
  }
}

type BackgroundImageProps = {
  x: number;
  y: number;
  scale: number;
};

type CanvasContextType = {
  canvasRef: React.RefObject<{ stage: any; layer: any; background: any }>;
  konvaObjects: any[];
  setKonvaObjects: React.Dispatch<React.SetStateAction<any[]>>;
  selectedNodes: any[];
  setSelectedNodes: React.Dispatch<React.SetStateAction<any[]>>;
  isMultiSelectMode: boolean;
  setMultiSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
  isCanvasReady: boolean;
  setCanvasReady: React.Dispatch<React.SetStateAction<boolean>>;
  isKonvaReady: boolean;
  setKonvaReady: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAddItemDialogOpen: boolean;
  setAddItemDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isShapeDialogOpen: boolean;
  setShapeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFrameDialogOpen: boolean;
  setFrameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMaskDialogOpen: boolean;
  setMaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isClipartDialogOpen: boolean;
  setClipartDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isIconDialogOpen: boolean;
  setIconDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingShapeNode: any;
  setEditingShapeNode: React.Dispatch<React.SetStateAction<any>>;
  editingFrameNode: any;
  setEditingFrameNode: React.Dispatch<React.SetStateAction<any>>;
  editingMaskNode: any;
  setEditingMaskNode: React.Dispatch<React.SetStateAction<any>>;
  editingTextNode: any;
  setEditingTextNode: React.Dispatch<React.SetStateAction<any>>;
  isCropModalOpen: boolean;
  setCropModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nodeToCrop: any;
  setNodeToCrop: React.Dispatch<React.SetStateAction<any>>;

  canvasSize: string;
  setCanvasSize: (size: string) => void;
  backgroundColor: any;
  setBackgroundColor: (color: any) => void;
  backgroundImage: string | null;
  setBackgroundImage: React.Dispatch<React.SetStateAction<string | null>>;
  backgroundImageProps: BackgroundImageProps;
  
  canvasScale: number;
  canvasPosition: { x: number; y: number };
  setCanvasPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  handleZoomChange: (value: string) => void;


  clipboard: any[];

  // Functions
  updateLayers: () => void;
  deselectNodes: () => void;
  handleSave: (format?: 'png' | 'jpg' | 'svg' | 'pdf') => void;
  handleMoveNode: (action: 'up' | 'down', nodeId: string) => void;
  handleAlign: (position: string) => void;
  handleOpacityChange: (opacity: number) => void;
  handleScaleChange: (scale: number) => void;
  handleRotationChange: (rotation: number) => void;
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
  handleAddClipart: (clipart: { parts: { [key: string]: string; }; defaultColors: { [key: string]: string; }; }) => void;
  handleAddIcon: (icon: { path: string }) => void;
  addImageToMask: (maskGroup: any) => void;
  handleMaskImageZoom: (direction: 'in' | 'out') => void;
  handleMaskImageReset: () => void;
  handleMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleAnimationChange: (animation: any) => void;
  handleClipartPartColorChange: (partName: string, color: string) => void;
  handleSetBackgroundImage: () => void;
  handleBackgroundImageZoom: (direction: 'in' | 'out') => void;
  handleBackgroundImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleBackgroundImageReset: () => void;
  handleRemoveBackgroundImage: () => void;
  handleCropImage: () => void;
  handleApplyCrop: (croppedDataUrl: string) => void;


  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  handleGroup: () => void;
  handleUngroup: () => void;
  handleDelete: () => void;
  handleCopy: () => void;
  handlePaste: () => void;
  forceRecord: () => void;

  isSelectionLocked: boolean;
  isAnySelectedLocked: boolean;
  toggleLock: () => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const canvasRef = useRef<{ stage: any; layer: any; background: any }>(null);
  const router = useRouter();

  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [isMultiSelectMode, setMultiSelectMode] = useState(false);
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [isKonvaReady, setKonvaReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  
 const [isPanning, setIsPanning] = useState(false);
 const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);
  const {
    canvasScale,
    canvasPosition,
    setCanvasPosition,
    zoomIn,
    zoomOut,
    fitToScreen,
    handleZoomChange,
    zoom
  } = useZoomPan({ canvasRef, isCanvasReady });
  

  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isShapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [editingShapeNode, setEditingShapeNode] = useState<any>(null);
  const [editingTextNode, setEditingTextNode] = useState<any>(null);
  const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
  const [editingFrameNode, setEditingFrameNode] = useState<any>(null);
  const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
  const [editingMaskNode, setEditingMaskNode] = useState<any>(null);
  const [isClipartDialogOpen, setClipartDialogOpen] = useState(false);
  const [isIconDialogOpen, setIconDialogOpen] = useState(false);
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const [nodeToCrop, setNodeToCrop] = useState<any>(null);
 

  const [canvasSize, setCanvasSizeState] = useState('1080x1080');
  
  
 
  const {
    undo: undoBase,
    redo: redoBase,
    canUndo,
    canRedo,
    forceRecord,
    runAsSingleHistoryStep,
  } = useCanvasChangeTracker(canvasRef, isCanvasReady);
  const {
    backgroundColor,
    setBackgroundColor,
    backgroundImage,
    setBackgroundImage,
    backgroundImageProps,
    handleSetBackgroundImage,
    handleBackgroundImageZoom,
    handleBackgroundImagePan,
    handleBackgroundImageReset,
    handleRemoveBackgroundImage
  } = useBackground({
    canvasRef,
    forceRecord,
    isKonvaReady
  });
  
  
  

  const setCanvasSize = (size: string) => {
    setCanvasSizeState(size);
    forceRecord();
  };
 

 



  const { isSelectionLocked, isAnySelectedLocked, toggleLock } = useLockHandler(
    selectedNodes,
    setSelectedNodes
  );

  const isNodeLocked = useCallback((n: any) => !!n?.getAttr?.('isLocked'), []);
 const getUnlocked = useCallback(
    (nodes: any[]) => nodes.filter((n) => !isNodeLocked(n)),
    [isNodeLocked]
  );
  const {
    applyFill,
    applyStroke,
    handleOpacityChange,
    handleScaleChange,
    handleRotationChange,
    handleFlip,
    handleAlign,
    handleMoveNode,
    handleColorUpdate
  } = useTransforms({
    canvasRef,
    selectedNodes,
    getUnlocked,
    isNodeLocked,
    forceRecord
  });
 

  
  
  const updateLayers = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;

    const children = layer.getChildren((node: any) => {
      const className = node?.getClassName?.() ?? '';
      const isTransformer = className === 'Transformer' || node?.hasName?.('Transformer');
      const isBackground = node?.name?.() === 'background';
      const hasId = !!node?.id?.();
      return hasId && !isTransformer && !isBackground;
    });

    setKonvaObjects(Array.from(children));
    layer.draw();
  }, []);

  const deselectNodes = useCallback(() => {
    setSelectedNodes([]);
  }, []);

  
  const handleDoubleClick = (node: any) => {
    const handleNodeDoubleClick = (targetNode: any) => {
        // Implementation will be provided by useNodeHandlers
    };
    handleNodeDoubleClick(node);
  };
  const attachDoubleClick = useCallback((node: Node) => {
    node.on('dblclick dbltap', () => {
      if (node.getAttr('isLocked')) return;
      let targetNode = node as any;
      if (node.parent?.hasName('circularText') || node.parent?.hasName('mask') || node.parent?.hasName('textGroup') || node.parent?.hasName('clipart')) {
        targetNode = node.parent;
      }
      if (targetNode.hasName('group')) {
        handleUngroup();
      } else {
        nodeHandlers.handleDoubleClick(targetNode);
      }
    });
  }, []);

  const {
    clipboard,
    handleCopy,
    handlePaste,
    handleDelete,
  } = useClipboard({
    canvasRef,
    selectedNodes,
    setSelectedNodes,
    getUnlocked,
    deselectNodes,
    updateLayers,
    attachDoubleClick,
    runAsSingleHistoryStep,
    forceRecord,
  });

  const { addImageToMask, handleAddMask, handleUpdateMask } = useMaskHandler({ canvasRef, updateLayers, setSelectedNodes, setIsLoading, attachDoubleClick: attachDoubleClick, editingMaskNode, setEditingMaskNode });
  const nodeHandlers = useNodeHandlers({ setEditingTextNode, setEditingShapeNode, setShapeDialogOpen, setEditingFrameNode, setFrameDialogOpen, addImageToMask, setIsLoading });
  const { handleAnimationChange } = useAnimationHandler({ canvasRef, selectedNodes, forceRecord });
  const { handleAddClipart } = useClipartHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });
  const { handleAddIcon } = useIconHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });

  const handleDoubleClickRef = useRef(handleDoubleClick);
  handleDoubleClickRef.current = nodeHandlers.handleDoubleClick;
  
  useEffect(() => {
    (handleDoubleClick as any).dependencies = [nodeHandlers.handleDoubleClick];
  }, [nodeHandlers.handleDoubleClick, handleDoubleClick]);

  
  const handleGroup = useCallback(() => {
  if (
    selectedNodes.length < 2 ||
    selectedNodes.some((node) => node.getAttr('isLocked')) ||
    !canvasRef.current?.layer
  )
    return;

  runAsSingleHistoryStep(() => {
    const layer = canvasRef.current!.layer;

    // Find the bounding box that contains all selected nodes
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    selectedNodes.forEach((node) => {
      const box = node.getClientRect({ relativeTo: layer });
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    });

    // Create group at the top-left of the bounding box
    const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const group = new window.Konva.Group({
      id: uniqueId,
      name: 'group',
      draggable: true,
      x: minX,
      y: minY,
    });
    group.listening(true);
    layer.add(group);
    attachDoubleClick(group);  

    // Move children to group with positions relative to group's origin
    selectedNodes.forEach((node) => {
      const box = node.getClientRect({ relativeTo: layer });
      const currentX = node.x();
      const currentY = node.y();
      
      // Calculate offset from node's current position to its visual position
      const offsetX = box.x - currentX;
      const offsetY = box.y - currentY;
      
      node.moveTo(group);
      
      // Set position relative to group, accounting for any offset
      node.position({
        x: box.x - minX - offsetX,
        y: box.y - minY - offsetY,
      });
      node.draggable(false);
      
    });
    // IMPORTANT: Set offset to center after children are added
    const groupBox = group.getClientRect({ skipTransform: true });
    group.offsetX(groupBox.width / 2);
    group.offsetY(groupBox.height / 2);
    group.x(minX + groupBox.width / 2);
    group.y(minY + groupBox.height / 2);

    layer.batchDraw();

    setSelectedNodes([group]);
    setMultiSelectMode(false);
    updateLayers();
  });
}, [
  selectedNodes,
  canvasRef,
  runAsSingleHistoryStep,
  setSelectedNodes,
  setMultiSelectMode,
  updateLayers,
  attachDoubleClick
]);

const handleUngroup = useCallback(() => {
  const group = selectedNodes[0];
  if (
    selectedNodes.length !== 1 ||
    !(group.hasName('group') || group.hasName('clipart')) ||
    group.getAttr('isLocked')
  )
    return;

  runAsSingleHistoryStep(() => {
    const layer = canvasRef.current?.layer ?? group.getLayer();
    const children = group.getChildren().slice();
    const nodesToSelect: Node[] = [];

    children.forEach((child: Node) => {
      // Store the absolute position BEFORE moving
      const absPos = child.getAbsolutePosition();
      
      // Move to layer
      child.moveTo(layer);
      
      // Restore the absolute position AFTER moving
      child.setAbsolutePosition(absPos);
      child.draggable(true);
      child.listening(true);
      
      nodesToSelect.push(child);
    });

    group.destroy();
    
    // Force layer update BEFORE batchDraw
    updateLayers();
    layer.batchDraw();

    setMultiSelectMode(true);
    setSelectedNodes(nodesToSelect);
  });
}, [
  selectedNodes,
  canvasRef,
  setMultiSelectMode,
  setSelectedNodes,
  updateLayers,
  runAsSingleHistoryStep,
]);

  useEffect(() => {
    (handleDoubleClick as any).dependencies = [handleUngroup, nodeHandlers.handleDoubleClick];
  }, [handleUngroup, nodeHandlers.handleDoubleClick, handleDoubleClick]);

  useSelection({ isCanvasReady, canvasRef, isMultiSelectMode, selectedNodes, setSelectedNodes });
  const { handleAddOrUpdateText } = useTextHandler({ canvasRef, updateLayers, setSelectedNodes, applyFill, attachDoubleClick: attachDoubleClick, editingTextNode, setEditingTextNode, forceRecord });
  const { handleAddShape, handleUpdateShape } = useShapeHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick: attachDoubleClick, editingShapeNode, setEditingShapeNode, forceRecord });
  const { handleAddFrame, handleUpdateFrame } = useFrameHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick: attachDoubleClick });

  const addImageFromComputer = useCallback(() => {
    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = 'image/png, image/jpeg,_jpg, image/gif, image/svg+xml';
    imageFileInput.onchange = () => {
      if (imageFileInput.files && imageFileInput.files.length > 0) {
        const file = imageFileInput.files[0];
        const reader = new FileReader();
        reader.onloadstart = () => setIsLoading(true);
        reader.onload = (e) => {
          window.Konva.Image.fromURL(e.target!.result as string, (img: any) => {
            if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
            const { stage, layer } = canvasRef.current;
            const MAX_WIDTH = stage.width() * 0.8;
            const MAX_HEIGHT = stage.height() * 0.8;
            const scale = Math.min(MAX_WIDTH / img.width(), MAX_HEIGHT / img.height(), 1);
            const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            img.setAttrs({ 
                id: uniqueId, 
                x: stage.width() / 2, 
                y: stage.height() / 2, 
                scaleX: scale, 
                scaleY: scale, 
                name: 'image', 
                draggable: true,
                offsetX: img.width() / 2,
                offsetY: img.height() / 2,
                'data-original-src': e.target!.result
            });

            img.on('dragend', () => {
              delete (img as any)._dragStartPos;
              delete (img as any)._dragStartBox;
            });

            attachDoubleClick(img);
            layer.add(img);
            updateLayers();
            setSelectedNodes([img]);
            layer.draw();
            setIsLoading(false);
            forceRecord();
          });
        };
        reader.onerror = () => setIsLoading(false);
        reader.readAsDataURL(file);
      }
      imageFileInput.value = '';
    };
    imageFileInput.click();
  }, [updateLayers, setIsLoading, setSelectedNodes, attachDoubleClick, forceRecord]);

  const handleSelectItem = useCallback((itemType: string) => {
    setAddItemDialogOpen(false);
    deselectNodes();
    if (!canvasRef.current) return;
    if(itemType === 'text') {
        handleAddOrUpdateText({
            text: 'New Text',
            fontSize: 48,
            fontFamily: 'Inter',
            isBold: false,
            isItalic: false,
            isUnderline: false,
            isStrikethrough: false,
            letterSpacing: 0,
            lineHeight: 1.2,
            align: 'center',
            isShadow: false,
            shadowBlur: 10,
            shadowDistance: 5,
            shadowOpacity: 0.5,
            isGlow: false,
            glowColor: '#0000ff',
            glowBlur: 10,
            glowOpacity: 0.7,
            radius: 150,
            curvature: 0,
          });
    }
    switch (itemType) {
      case 'shape': setEditingShapeNode(null); setShapeDialogOpen(true); break;
      case 'image': addImageFromComputer(); break;
      case 'frame': setEditingFrameNode(null); setFrameDialogOpen(true); break;
      case 'mask': setEditingMaskNode(null); setMaskDialogOpen(true); break;
      case 'clipart': setClipartDialogOpen(true); break;
      case 'icon': setIconDialogOpen(true); break;
      default: break;
    }
  }, [deselectNodes, addImageFromComputer, setAddItemDialogOpen, handleAddOrUpdateText, setShapeDialogOpen, setFrameDialogOpen, setMaskDialogOpen, setClipartDialogOpen, setIconDialogOpen, setEditingShapeNode, setEditingFrameNode, setEditingMaskNode]);

 const handleClipartPartColorChange = useCallback((partName: string, color: string) => {
    const clipartNode = selectedNodes.find(n => n.hasName('clipart'));
    if (!clipartNode || isNodeLocked(clipartNode)) return;

    let partsToUpdate;
    if (partName === 'eyes') {
        partsToUpdate = clipartNode.find('.clipart-leftEye, .clipart-rightEye');
    } else {
        partsToUpdate = clipartNode.find(`.clipart-${partName}`);
    }

    if (partsToUpdate.length > 0) {
        partsToUpdate.forEach((part: any) => {
            part.fill(color);
            part.setAttr(`data-color-${partName}`, color);
        });
        canvasRef.current?.layer.draw();
        forceRecord?.();
    }
}, [selectedNodes, isNodeLocked, forceRecord, canvasRef]);


  const handleMaskImageZoom = useCallback((direction: 'in' | 'out') => {
    if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
    const selectedNode = selectedNodes[0];
    if (isNodeLocked(selectedNode)) return;
    const image = selectedNode.findOne('.mask-image');
    if (!image) return;
    const scaleBy = 1.1;
    const oldScale = image.scaleX();
    const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
    image.scale({ x: newScale, y: newScale });
    canvasRef.current?.layer.batchDraw();
    forceRecord?.();
  }, [selectedNodes, forceRecord, isNodeLocked]);

  const handleMaskImageReset = useCallback(() => {
    if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
    const selectedNode = selectedNodes[0];
    if (isNodeLocked(selectedNode)) return;
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
    forceRecord?.();
  }, [selectedNodes, forceRecord, isNodeLocked]);

  const handleMaskImagePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
    const selectedNode = selectedNodes[0];
    if (isNodeLocked(selectedNode)) return;
    const image = selectedNode.findOne('.mask-image');
    if (!image) return;
    const panAmount = 10;
    const currentPos = image.position();
    let newPos = { ...currentPos };
    switch (direction) {
      case 'up': newPos.y -= panAmount; break;
      case 'down': newPos.y += panAmount; break;
      case 'left': newPos.x += panAmount; break;
      case 'right': newPos.x -= panAmount; break;
    }
    const boundFunc = image.getAttr('dragBoundFunc');
    if (boundFunc) newPos = boundFunc.call(image, newPos);
    image.position(newPos);
    canvasRef.current?.layer.batchDraw();
    forceRecord?.();
  }, [selectedNodes, forceRecord, isNodeLocked]);



  const handleSave = useCallback((format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png', quality: number = 1) => {
    if (!canvasRef.current?.stage || !canvasRef.current?.layer || !canvasRef.current?.background) return;
    const stage = canvasRef.current.stage;
    const layer = canvasRef.current.layer;
    const background = canvasRef.current.background;
    
    // Deselect all nodes
    deselectNodes();
    
    // Hide all transformers
    const transformers = layer.find('Transformer');
    transformers.forEach((tr: any) => tr.visible(false));
    
    // Wait for the layer to redraw before capturing
    layer.batchDraw();
    
    // Use setTimeout to ensure the draw is complete
    setTimeout(() => {
      // Get canvas dimensions
      const canvasWidth = background.width();
      const canvasHeight = background.height();
      
      // Create a temporary stage with exact canvas dimensions
      const tempStage = new window.Konva.Stage({
        container: document.createElement('div'),
        width: canvasWidth,
        height: canvasHeight,
      });
      
      const tempLayer = new window.Konva.Layer();
      tempStage.add(tempLayer);
      
      // Clone the background
      const bgClone = background.clone();
      bgClone.position({ x: 0, y: 0 });
      tempLayer.add(bgClone);
      
      // Clone all visible objects (excluding transformers)
      layer.getChildren().forEach((child: any) => {
        if (child === background) return; // Already added
        if (child.getClassName?.() === 'Transformer') return;
        if (child.hasName?.('Transformer')) return;
        if (child.name?.() === 'background') return;
        if (child.name?.() === 'selection-rect') return;
        
        const clone = child.clone();
        tempLayer.add(clone);
      });
      
      tempLayer.batchDraw();
      
      let dataURL: string;
      let filename: string;
      
      if (format === 'svg') {
        dataURL = tempStage.toDataURL({ mimeType: 'image/svg+xml' });
        filename = 'konva-design.svg';
      } else if (format === 'pdf') {
        dataURL = tempStage.toDataURL({ 
          mimeType: 'image/png', 
          quality: 1,
          pixelRatio: 3
        });
        filename = 'konva-design-print.png';
      } else if (format === 'jpg') {
        dataURL = tempStage.toDataURL({ _content: tempLayer.toCanvas().toDataURL('image/jpeg', quality) });
        filename = 'konva-design.jpg';
      } else {
        dataURL = tempStage.toDataURL({ 
          mimeType: 'image/png', 
          quality: quality,
          pixelRatio: quality === 1 ? 2 : 1
        });
        filename = 'konva-design.png';
      }
      
      // Clean up temp stage
      tempStage.destroy();
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Restore transformers visibility
      transformers.forEach((tr: any) => tr.visible(true));
      layer.batchDraw();
    }, 100);
  }, [deselectNodes]);


 
  const handleCropImage = useCallback(() => {
    if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('image')) {
      return;
    }
    const imageNode = selectedNodes[0];
    setNodeToCrop(imageNode);
    setCropModalOpen(true);
  }, [selectedNodes]);
  
  const handleApplyCrop = useCallback((croppedDataUrl: string) => {
    if (!nodeToCrop) return;
  
    const imageObj = new window.Image();
    imageObj.onload = () => {
      nodeToCrop.image(imageObj);
      nodeToCrop.setAttr('data-original-src', croppedDataUrl);
      
      nodeToCrop.width(imageObj.width);
      nodeToCrop.height(imageObj.height);
      nodeToCrop.offsetX(imageObj.width / 2);
      nodeToCrop.offsetY(imageObj.height / 2);

  
      canvasRef.current?.layer?.batchDraw();
      forceRecord?.();
    };
    imageObj.src = croppedDataUrl;
  
    setCropModalOpen(false);
    setNodeToCrop(null);
  }, [nodeToCrop, canvasRef, forceRecord]);

  useEffect(() => {
    if (isKonvaReady && canvasRef.current?.background) {
      const backgroundRect = canvasRef.current.background;
      const layer = canvasRef.current.layer;

      backgroundRect.fill(null);
      backgroundRect.fillLinearGradientColorStops(null);
      backgroundRect.fillRadialGradientColorStops(null);
      backgroundRect.fillPatternImage(null);

      if (backgroundImage) {
          // background image is handled by Canvas.tsx
      } else if (backgroundColor.isGradient) {
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
      if (layer) layer.draw();
    }
  }, [backgroundColor, isKonvaReady, backgroundImage]);

  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const children = layer.getChildren((n: any) => {
      const className = n?.getClassName?.() ?? '';
      const isTransformer = className === 'Transformer' || n?.hasName?.('Transformer');
      const isBackground = n?.name?.() === 'background';
      const hasId = !!n?.id?.();
      return hasId && !isTransformer && !isBackground;
    });
    setKonvaObjects(Array.from(children ?? []));
  }, [selectedNodes]);
  
  useEffect(() => {
    const container = document.getElementById('canvas-wrapper');
    const stage = canvasRef.current?.stage;
    if (!container || !stage || !isCanvasReady) return;
  
    const getStagePointerFromTouch = (touch: Touch | undefined) => {
      if (!touch) return null;
      const rect = container.getBoundingClientRect();
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };
  
    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const pointer = getStagePointerFromTouch(touch);
      if (!pointer) return;
  
      const konvaTarget = stage.getIntersection(pointer);
  
      if (konvaTarget && konvaTarget !== stage && (konvaTarget.name && konvaTarget.name() !== 'background')) {
        setIsPanning(false);
        setLastTouch(null);
        return;
      }
  
      setIsPanning(true);
      setLastTouch({ x: touch.clientX, y: touch.clientY });
    };
  
    const onTouchMove = (e: TouchEvent) => {
      if (!isPanning || !lastTouch || !e.touches || !e.touches.length) return;
      const touch = e.touches[0];
  
      e.preventDefault();
  
      const dx = touch.clientX - lastTouch.x;
      const dy = touch.clientY - lastTouch.y;
  
      const stageWidth = stage.width() * canvasScale;
      const stageHeight = stage.height() * canvasScale;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
  
      setCanvasPosition((prev) => {
        let newX = prev.x + dx;
        let newY = prev.y + dy;
  
        const minX = containerWidth - stageWidth;
        const minY = containerHeight - stageHeight;
  
        if (stageWidth <= containerWidth) {
          newX = Math.round((containerWidth - stageWidth) / 2);
        } else {
          newX = Math.min(0, Math.max(newX, minX));
        }
  
        if (stageHeight <= containerHeight) {
          newY = Math.round((containerHeight - stageHeight) / 2);
        } else {
          newY = Math.min(0, Math.max(newY, minY));
        }
  
        return { x: newX, y: newY };
      });
  
      setLastTouch({ x: touch.clientX, y: touch.clientY });
    };
  
    const onTouchEnd = () => {
      setIsPanning(false);
      setLastTouch(null);
    };
  
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);
  
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isCanvasReady, canvasScale, isPanning, lastTouch, setCanvasPosition, canvasRef]);
  

  useEffect(() => {
    if (isKonvaReady && isCanvasReady && canvasRef.current?.stage) {
      const stage = canvasRef.current.stage;
      
      fitToScreen();
      window.addEventListener('resize', fitToScreen);

      // Set initial loading to false only after everything is ready
      setIsLoading(false);

      return () => {
          window.removeEventListener('resize', fitToScreen);
          if (stage && typeof stage.off === 'function') {
            stage.off('dragmove');
          }
      };
    }
}, [isKonvaReady, isCanvasReady, fitToScreen, canvasRef]);

  type LockedSnapshot = { id: string; className: string; attrs: any; parentId?: string; zIndex?: number; };
  const snapshotLockedNodes = useCallback((): LockedSnapshot[] => {
    const layer = canvasRef.current?.layer;
    if (!layer) return [];
    const locked: any[] = layer.find((n: any) => n.getAttr && n.getAttr('isLocked'));
    return locked.map((n: any) => ({ id: n.id?.() || '', className: n.getClassName?.() || 'Group', attrs: { ...n.getAttrs?.() }, parentId: n.getParent?.()?.id?.(), zIndex: n.getZIndex?.() }));
  }, []);

  const restoreLockedNodes = useCallback((snapshots: LockedSnapshot[]) => {
    const layer = canvasRef.current?.layer;
    if (!layer) return;
    snapshots.forEach((s) => {
      let target: any = layer.findOne(`#${s.id}`);
      if (target) {
        target.setAttrs(s.attrs);
        if (typeof s.zIndex === 'number') {
          try {
            target.setZIndex(s.zIndex);
          } catch { /* ignore */ }
        }
      } else {
        const Ctor = (window.Konva as any)[s.className] || window.Konva.Group;
        const node = new Ctor(s.attrs);
        const parent = (s.parentId && (layer.findOne(`#${s.parentId}`) as any)) || layer;
        parent.add(node);
      }
    });
    layer.batchDraw();
  }, []);

  const undo = useCallback(() => {
    const lockedBefore = snapshotLockedNodes();
    undoBase();
    restoreLockedNodes(lockedBefore);
  }, [undoBase, snapshotLockedNodes, restoreLockedNodes]);

  const redo = useCallback(() => {
    const lockedBefore = snapshotLockedNodes();
    redoBase();
    restoreLockedNodes(lockedBefore);
  }, [redoBase, snapshotLockedNodes, restoreLockedNodes]);

  const value: CanvasContextType = {
    canvasRef, konvaObjects, setKonvaObjects, selectedNodes, setSelectedNodes, isMultiSelectMode, setMultiSelectMode,
    isCanvasReady, setCanvasReady, isKonvaReady, setKonvaReady, isLoading, setIsLoading, isAddItemDialogOpen,
    setAddItemDialogOpen, isShapeDialogOpen, setShapeDialogOpen, isFrameDialogOpen,
    setFrameDialogOpen, isMaskDialogOpen, setMaskDialogOpen, isClipartDialogOpen, setClipartDialogOpen, isIconDialogOpen, setIconDialogOpen, editingShapeNode, 
    setEditingShapeNode, editingFrameNode, setEditingFrameNode, editingMaskNode, setEditingMaskNode, editingTextNode, 
    setEditingTextNode, isCropModalOpen, setCropModalOpen, nodeToCrop, setNodeToCrop,
    canvasSize, setCanvasSize, backgroundColor, setBackgroundColor, backgroundImage, setBackgroundImage, backgroundImageProps, clipboard,
    canvasScale, canvasPosition, setCanvasPosition, zoomIn, zoomOut, fitToScreen, handleZoomChange,
    updateLayers, deselectNodes, handleSave, handleMoveNode, handleAlign, handleOpacityChange, handleScaleChange, handleRotationChange, handleFlip,
    handleColorUpdate, handleSelectItem, addImageFromComputer, handleAddShape, handleUpdateShape, handleAddOrUpdateText,
    handleAddFrame, handleUpdateFrame, handleAddMask, handleUpdateMask, handleAddClipart, handleAddIcon, addImageToMask, handleMaskImageZoom,
    handleMaskImageReset, handleMaskImagePan, handleAnimationChange,
    handleClipartPartColorChange, handleSetBackgroundImage, handleBackgroundImageZoom, handleBackgroundImagePan, handleBackgroundImageReset,
    handleRemoveBackgroundImage, handleCropImage, handleApplyCrop,
    undo, redo, canUndo, canRedo,
    handleGroup, handleUngroup, handleDelete, handleCopy, handlePaste, forceRecord,
    isSelectionLocked, isAnySelectedLocked, toggleLock,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
