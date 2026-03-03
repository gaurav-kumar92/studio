
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
import { useLockHandler } from '@/hooks/useLockHandler';
import { useAnimationHandler } from '@/hooks/useAnimationHandler';
import { useRouter } from 'next/navigation';
import { useZoomPan } from "@/hooks/useZoomPan";
import { useBackground } from "@/hooks/useBackground";
import { useTransforms } from "@/hooks/useTransforms";
import { useClipboard } from '@/hooks/useClipboard';
import { useGrouping } from '@/hooks/useGrouping';
import { useExport } from '@/hooks/useExport';
import { useMaskImageControls } from '@/hooks/useMaskImageControls';
import { useCrop } from '@/hooks/useCrop';
import { useSymbolHandler } from '@/hooks/useSymbolHandler';
import { useCanvasPersistence } from '@/hooks/useCanvasPersistence';

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
  isEmojiDialogOpen: boolean;
  setEmojiDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  handleSave: (format?: 'png' | 'jpg' | 'svg' | 'pdf'| 'gif') => void;
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
  handleAddSymbol: (symbol: string) => void;
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
  
  const {
    canvasScale,
    canvasPosition,
    setCanvasPosition,
    zoomIn,
    zoomOut,
    fitToScreen,
    handleZoomChange,
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
  const [isEmojiDialogOpen, setEmojiDialogOpen] = useState(false);
 

  const [canvasSize, setCanvasSizeState] = useState('1080x1080');
  
  const setCanvasSize = (size: string) => {
    setCanvasSizeState(size);
  };

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

  const {
    save,
    undo,
    redo,
    canUndo,
    canRedo,
    forceRecord,
  } = useCanvasPersistence({
    canvasRef,
    isCanvasReady,
    setKonvaObjects,
    attachDoubleClick: (node: any) => nodeHandlers.attachDoubleClick(node),
    setSelectedNodes,
  });

  const {
    isCropModalOpen,
    setCropModalOpen,
    nodeToCrop,
    setNodeToCrop,
    handleCropImage,
    handleApplyCrop,
  } = useCrop({
    canvasRef,
    selectedNodes,
    forceRecord,
  });
 
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
 
  const {
    handleMaskImageZoom,
    handleMaskImageReset,
    handleMaskImagePan,
  } = useMaskImageControls({
    canvasRef,
    selectedNodes,
    isNodeLocked,
    forceRecord,
  });
  
  const { handleAnimationChange, timelineState } = useAnimationHandler({ canvasRef, selectedNodes, forceRecord });
  
  const { handleSave } = useExport({
    canvasRef,
    deselectNodes,
    timelineState,
  });
  
  const attachDoubleClick = useCallback((node: any) => {
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
    forceRecord,
  });

  const {
    handleGroup,
    handleUngroup,
  } = useGrouping({
    canvasRef,
    selectedNodes,
    setSelectedNodes,
    setMultiSelectMode,
    updateLayers,
    attachDoubleClick,
  });
  

  const { addImageToMask, handleAddMask, handleUpdateMask } = useMaskHandler({ canvasRef, updateLayers, setSelectedNodes, setIsLoading, attachDoubleClick: attachDoubleClick, editingMaskNode, setEditingMaskNode });
  const nodeHandlers = useNodeHandlers({ setEditingTextNode, setEditingShapeNode, setShapeDialogOpen, setEditingFrameNode, setFrameDialogOpen, addImageToMask, setIsLoading });
  
  const { handleAddClipart } = useClipartHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });
  const { handleAddIcon } = useIconHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });
  const { handleAddSymbol } = useSymbolHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });

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
      case 'emoji': setEmojiDialogOpen(true); break;
      default: break;
    }
  }, [deselectNodes, addImageFromComputer, setAddItemDialogOpen, handleAddOrUpdateText, setShapeDialogOpen, setFrameDialogOpen, setMaskDialogOpen, setClipartDialogOpen, setIconDialogOpen, setEmojiDialogOpen, setEditingShapeNode, setEditingFrameNode, setEditingMaskNode]);

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

  useEffect(() => {
    if (isKonvaReady && isCanvasReady && canvasRef.current?.background) {
      // background drawing logic is handled in useBackground
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
  }, [selectedNodes, updateLayers]);
  
  useEffect(() => {
    if (isKonvaReady && isCanvasReady && canvasRef.current?.stage) {
      fitToScreen();
      window.addEventListener('resize', fitToScreen);
      setIsLoading(false);
      return () => {
          window.removeEventListener('resize', fitToScreen);
      };
    }
  }, [isKonvaReady, isCanvasReady, fitToScreen]);

  const value: CanvasContextType = {
    canvasRef, konvaObjects, setKonvaObjects, selectedNodes, setSelectedNodes, isMultiSelectMode, setMultiSelectMode,
    isCanvasReady, setCanvasReady, isKonvaReady, setKonvaReady, isLoading, setIsLoading, isAddItemDialogOpen,
    setAddItemDialogOpen, isShapeDialogOpen, setShapeDialogOpen, isFrameDialogOpen,
    setFrameDialogOpen, isMaskDialogOpen, setMaskDialogOpen, isClipartDialogOpen, setClipartDialogOpen, isIconDialogOpen, setIconDialogOpen, isEmojiDialogOpen, setEmojiDialogOpen, editingShapeNode, 
    setEditingShapeNode, editingFrameNode, setEditingFrameNode, editingMaskNode, setEditingMaskNode, editingTextNode, 
    setEditingTextNode, isCropModalOpen, setCropModalOpen, nodeToCrop, setNodeToCrop,
    canvasSize, setCanvasSize, backgroundColor, setBackgroundColor, backgroundImage, setBackgroundImage, backgroundImageProps, clipboard,
    canvasScale, canvasPosition, setCanvasPosition, zoomIn, zoomOut, fitToScreen, handleZoomChange,
    updateLayers, deselectNodes, handleSave, handleMoveNode, handleAlign, handleOpacityChange, handleScaleChange, handleRotationChange, handleFlip,
    handleColorUpdate, handleSelectItem, addImageFromComputer, handleAddShape, handleUpdateShape, handleAddOrUpdateText,
    handleAddFrame, handleUpdateFrame, handleAddMask, handleUpdateMask, handleAddClipart, handleAddIcon, handleAddSymbol, addImageToMask, handleMaskImageZoom,
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
