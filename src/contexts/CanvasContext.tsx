
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
import { useNodeHandlers } from '@/hooks/useNodeHandlers';
import { useSelection } from '@/hooks/useSelection';
import { useCanvasChangeTracker } from '@/hooks/useCanvasChangeTracker';
import { useLockHandler } from '@/hooks/useLockHandler';
import { useAnimationHandler } from '@/hooks/useAnimationHandler';
import { Node } from 'konva/lib/Node';

declare global {
  interface Window {
    Konva: any;
    isOpeningFileDialog?: boolean;
  }
}

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
  editingShapeNode: any;
  setEditingShapeNode: React.Dispatch<React.SetStateAction<any>>;
  editingFrameNode: any;
  setEditingFrameNode: React.Dispatch<React.SetStateAction<any>>;
  editingMaskNode: any;
  setEditingMaskNode: React.Dispatch<React.SetStateAction<any>>;
  editingTextNode: any;
  setEditingTextNode: React.Dispatch<React.SetStateAction<any>>;

  canvasSize: string;
  setCanvasSize: (size: string) => void;
  backgroundColor: any;
  setBackgroundColor: (color: any) => void;
  
  canvasScale: number;
  canvasPosition: { x: number; y: number };
  setCanvasPosition: React.Dispatch<React.SetStateAction<{ x: number, y: number }>>;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  handleZoomChange: (value: string) => void;


  clipboard: any[];

  // Functions
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
  handleAddClipart: (clipart: { parts: { [key: string]: string; }; defaultColors: { [key: string]: string; }; }) => void;
  addImageToMask: (maskGroup: any) => void;
  handleMaskImageZoom: (direction: 'in' | 'out') => void;
  handleMaskImageReset: () => void;
  handleMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleAnimationChange: (animation: any) => void;
  playAllAnimations: () => void;
  handleClipartPartColorChange: (partName: string, color: string) => void;

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

  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [isMultiSelectMode, setMultiSelectMode] = useState(false);
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [isKonvaReady, setKonvaReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });


  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isShapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [editingShapeNode, setEditingShapeNode] = useState<any>(null);
  const [editingTextNode, setEditingTextNode] = useState<any>(null);
  const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
  const [editingFrameNode, setEditingFrameNode] = useState<any>(null);
  const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
  const [editingMaskNode, setEditingMaskNode] = useState<any>(null);
  const [isClipartDialogOpen, setClipartDialogOpen] = useState(false);
  const [clipboard, setClipboard] = useState<any[]>([]);

  const [canvasSize, setCanvasSizeState] = useState('1080x1080');
  const [backgroundColor, setBackgroundColorState] = useState({
    isGradient: false,
    solidColor: '#ffffff',
    gradientDirection: 'top-to-bottom',
    colorStops: [
      { id: 0, stop: 0, color: '#3b82f6' },
      { id: 1, stop: 1, color: '#a855f7' },
    ],
  });

  const {
    undo: undoBase,
    redo: redoBase,
    canUndo,
    canRedo,
    forceRecord,
    runAsSingleHistoryStep,
  } = useCanvasChangeTracker(canvasRef, isCanvasReady);

  const setCanvasSize = (size: string) => {
    setCanvasSizeState(size);
    forceRecord();
  };
  const setBackgroundColor = (color: any) => {
    setBackgroundColorState(color);
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
  
  const fitToScreen = useCallback(() => {
    if (!canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;
    const container = document.getElementById('canvas-wrapper');
    if (!container) return;

    const padding = 30;
    const containerWidth = container.clientWidth - padding;
    const containerHeight = container.clientHeight - padding;

    const scale = Math.min(containerWidth / stage.width(), containerHeight / stage.height());
    setCanvasScale(scale);
  }, []);

  const zoom = useCallback((direction: 'in' | 'out') => {
    const scaleBy = 1.1;
    const oldScale = canvasScale;
    const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
    setCanvasScale(newScale);
  }, [canvasScale]);

  const zoomIn = useCallback(() => zoom('in'), [zoom]);
  const zoomOut = useCallback(() => zoom('out'), [zoom]);
  
  const handleZoomChange = useCallback((value: string) => {
    if (value === 'auto') {
        fitToScreen();
    } else {
        setCanvasScale(parseFloat(value));
    }
  }, [fitToScreen]);

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

  const applyFill = useCallback(
    (node: any, config: any) => {
      if (isNodeLocked(node)) return;
      let targetNodes;

      if (node.hasName('clipart')) {
          targetNodes = node.find('.clipart-face');
      } else if (node.hasName('textGroup') || node.hasName('circularText')) {
          targetNodes = node.find('.mainChar, .text, Text');
      } else {
          targetNodes = [node];
      }

      targetNodes.forEach((n: any) => {
        if (isNodeLocked(n) || typeof n.fill !== 'function') return;

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
    },
    [isNodeLocked]
  );

  const applyStroke = useCallback(
    (node: any, config: any) => {
      if (isNodeLocked(node)) return;
      if (config.isGradient) {
        const { width, height } = node.getClientRect({ relativeTo: node.getParent() });
        const colorStopsFlat = config.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };
        switch (config.gradientDirection) {
          case 'left-to-right': end = { x: width, y: 0 }; break;
          case 'diagonal-tl-br': end = { x: width, y: height }; break;
          case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
          case 'radial': case 'top-to-bottom': default: end = { x: 0, y: height }; break;
        }
        node.strokeLinearGradientStartPoint(start);
        node.strokeLinearGradientEndPoint(end);
        node.strokeLinearGradientColorStops(colorStopsFlat);
        node.setAttr('data-is-gradient', true);
        node.setAttr('data-gradient-direction', config.gradientDirection);
        node.setAttr('data-color-stops', config.colorStops);
      } else {
        const solidColor = config.solidColor || node.getAttr('data-solid-color') || '#3b82f6';
        node.strokeLinearGradientStartPoint({ x: 0, y: 0 });
        node.strokeLinearGradientEndPoint({ x: 0, y: 0 });
        node.strokeLinearGradientColorStops(null);
        node.stroke(solidColor);
        node.setAttr('data-is-gradient', false);
        node.setAttr('data-solid-color', solidColor);
      }
      const layer = node.getLayer();
      if (layer) layer.draw();
    },
    [isNodeLocked]
  );
  
  const handleDoubleClick = useCallback((node: any) => {
    const handleNodeDoubleClick = (targetNode: any) => {
        // Implementation will be provided by useNodeHandlers
    };
    handleNodeDoubleClick(node);
  }, []);

  const handleUngroup = useCallback(() => {
    const group = selectedNodes[0];
    if (selectedNodes.length !== 1 || !group.hasName('group') || group.getAttr('isLocked') || !canvasRef.current?.layer) return;
    runAsSingleHistoryStep(() => {
      const layer = canvasRef.current!.layer;
      const children = group.getChildren().slice();
      const nodesToSelect: Node[] = [];
      children.forEach((child: Node) => {
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
    });
  }, [selectedNodes, canvasRef, setMultiSelectMode, setSelectedNodes, updateLayers, runAsSingleHistoryStep]);

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
        handleDoubleClick(targetNode);
      }
    });
  }, [handleUngroup, handleDoubleClick]);

  const { addImageToMask, handleAddMask, handleUpdateMask } = useMaskHandler({ canvasRef, updateLayers, setSelectedNodes, setIsLoading, attachDoubleClick: attachDoubleClick, editingMaskNode, setEditingMaskNode });
  const nodeHandlers = useNodeHandlers({ setEditingTextNode, setEditingShapeNode, setShapeDialogOpen, setEditingFrameNode, setFrameDialogOpen, addImageToMask, setIsLoading });
  const { handleAnimationChange, playAllAnimations } = useAnimationHandler({ canvasRef, selectedNodes, forceRecord });
  const { handleAddClipart } = useClipartHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });

  const handleDoubleClickRef = useRef(handleDoubleClick);
  handleDoubleClickRef.current = nodeHandlers.handleDoubleClick;
  
  useEffect(() => {
    (handleDoubleClick as any).dependencies = [nodeHandlers.handleDoubleClick];
  }, [nodeHandlers.handleDoubleClick, handleDoubleClick]);

  const handleGroup = useCallback(() => {
    const processNodes = selectedNodes.filter((node) => !node.getAttr('isLocked'));
    if (processNodes.length < 2 || !canvasRef.current?.layer) return;
    runAsSingleHistoryStep(() => {
      const layer = canvasRef.current!.layer;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      processNodes.forEach((node) => {
        const box = node.getClientRect({ skipTransform: false });
        minX = Math.min(minX, box.x);
        minY = Math.min(minY, box.y);
        maxX = Math.max(maxX, box.x + box.width);
        maxY = Math.max(maxY, box.y + box.height);
      });
      const groupRect = { x: minX, y: minY };
      const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newGroup = new window.Konva.Group({ id: uniqueId, draggable: true, name: 'group', x: groupRect.x, y: groupRect.y });
      attachDoubleClick(newGroup as unknown as Node);
      layer.add(newGroup);
      processNodes.forEach((node) => {
        const nodeAbsPos = node.getAbsolutePosition();
        node.draggable(false);
        node.moveTo(newGroup);
        node.position({ x: nodeAbsPos.x - groupRect.x, y: nodeAbsPos.y - groupRect.y });
      });
      layer.draw();
      setMultiSelectMode(false);
      setSelectedNodes([newGroup]);
      updateLayers();
    });
  }, [selectedNodes, canvasRef, attachDoubleClick, setMultiSelectMode, setSelectedNodes, updateLayers, runAsSingleHistoryStep]);

  useEffect(() => {
    (handleDoubleClick as any).dependencies = [handleUngroup, nodeHandlers.handleDoubleClick];
  }, [handleUngroup, nodeHandlers.handleDoubleClick, handleDoubleClick]);

  useSelection({ isCanvasReady, canvasRef, isMultiSelectMode, selectedNodes, setSelectedNodes });
  const { handleAddOrUpdateText } = useTextHandler({ canvasRef, updateLayers, deselectNode: deselectNodes, setSelectedNodes, applyFill, attachDoubleClick: attachDoubleClick, editingTextNode, setEditingTextNode, forceRecord });
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
            img.setAttrs({ id: uniqueId, x: (stage.width() - img.width() * scale) / 2, y: (stage.height() - img.height() * scale) / 2, scaleX: scale, scaleY: scale, name: 'image', draggable: true });
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
      default: break;
    }
  }, [deselectNodes, addImageFromComputer, setAddItemDialogOpen, handleAddOrUpdateText, setShapeDialogOpen, setFrameDialogOpen, setMaskDialogOpen, setClipartDialogOpen, setEditingShapeNode, setEditingFrameNode, setEditingMaskNode]);

  const handleMoveNode = useCallback((action: 'up' | 'down', nodeId: string) => {
    if (!canvasRef.current?.layer) return;
    const { layer } = canvasRef.current;
    const node = layer.findOne(`#${nodeId}`);
    if (!node || isNodeLocked(node)) return;
    if (action === 'up') node.moveUp();
    else if (action === 'down' && node.getZIndex() > 1) node.moveDown();
    updateLayers();
    layer.batchDraw();
    forceRecord?.();
  }, [updateLayers, forceRecord, isNodeLocked]);

  const handleAlign = useCallback((position: string) => {
    if (!canvasRef.current?.stage) return;
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;
    const stage = canvasRef.current.stage;
    nodes.forEach((node) => {
      const box = node.getClientRect();
      let newX: number | undefined, newY: number | undefined;
      switch (position) {
        case 'top': newY = node.y() - box.y; node.y(newY); break;
        case 'left': newX = node.x() - box.x; node.x(newX); break;
        case 'center': newX = node.x() + (stage.width() / 2 - (box.x + box.width / 2)); newY = node.y() + (stage.height() / 2 - (box.y + box.height / 2)); node.x(newX); node.y(newY); break;
        case 'right': newX = node.x() + (stage.width() - (box.x + box.width)); node.x(newX); break;
        case 'bottom': newY = node.y() - (box.y + box.height - stage.height()); node.y(newY); break;
      }
    });
    canvasRef.current?.layer?.draw?.();
    forceRecord?.();
  }, [selectedNodes, forceRecord, getUnlocked]);

  const handleOpacityChange = useCallback((opacity: number) => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;
    nodes.forEach((node) => node.opacity(opacity));
    canvasRef.current?.layer?.draw?.();
    forceRecord?.();
  }, [selectedNodes, forceRecord, getUnlocked]);

  const handleFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    const layer = canvasRef.current?.layer;
    if (!layer) return;
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;
    nodes.forEach((node) => {
      const box = node.getClientRect();
      if (direction === 'horizontal') node.scaleX(node.scaleX() * -1);
      else node.scaleY(node.scaleY() * -1);
      const newBox = node.getClientRect();
      const deltaX = (box.x + box.width / 2) - (newBox.x + newBox.width / 2);
      const deltaY = (box.y + box.height / 2) - (newBox.y + newBox.height / 2);
      node.x(node.x() + deltaX);
      node.y(node.y() + deltaY);
    });
    layer.batchDraw();
    forceRecord?.();
  }, [selectedNodes, forceRecord, getUnlocked]);

  const handleColorUpdate = useCallback((config: any) => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;
    nodes.forEach((node) => {
      if (node.hasName('group')) {
        node.find('*').forEach((child: any) => {
          if (isNodeLocked(child)) return;
          const childUsesStroke = (child.name() === 'shape' && (child.getAttr('data-type') === 'line' || child.getAttr('data-type') === 'arrow' || child.getAttr('data-type') === 'curve')) || child.name() === 'frame';
          child.setAttrs({ 'data-is-gradient': config.isGradient, 'data-solid-color': config.solidColor, 'data-color-stops': config.colorStops, 'data-gradient-direction': config.gradientDirection });
          if (childUsesStroke) applyStroke(child, config);
          else applyFill(child, config);
        });
      } else {
        const nodeType = node.name();
        const shapeType = node.getAttr('data-type');
        const usesStroke = (nodeType === 'shape' && (shapeType === 'line' || shapeType === 'arrow' || shapeType === 'curve')) || nodeType === 'frame';
        node.setAttrs({ 'data-is-gradient': config.isGradient, 'data-solid-color': config.solidColor, 'data-color-stops': config.colorStops, 'data-gradient-direction': config.gradientDirection });
        if (usesStroke) applyStroke(node, config);
        else applyFill(node, config);
      }
    });
    canvasRef.current?.layer.draw();
    forceRecord?.();
  }, [selectedNodes, applyFill, applyStroke, canvasRef, forceRecord, getUnlocked, isNodeLocked]);
  
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
      case 'left': newPos.x -= panAmount; break;
      case 'right': newPos.x += panAmount; break;
    }
    const boundFunc = image.getAttr('dragBoundFunc');
    if (boundFunc) newPos = boundFunc.call(image, newPos);
    image.position(newPos);
    canvasRef.current?.layer.batchDraw();
    forceRecord?.();
  }, [selectedNodes, forceRecord, isNodeLocked]);

  const handleDelete = useCallback(() => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;
    forceRecord?.();
    nodes.forEach((node) => node.destroy());
    deselectNodes();
    updateLayers();
    forceRecord?.();
  }, [selectedNodes, deselectNodes, updateLayers, forceRecord, getUnlocked]);

  const handleSave = useCallback(() => {
    if (!canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;
    deselectNodes();
    const dataURL = stage.toDataURL({ mimeType: 'image/png', quality: 1 });
    const link = document.createElement('a');
    link.download = 'konva-design.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [deselectNodes]);

  const handleCopy = useCallback(() => {
    const unlockedNodes = getUnlocked(selectedNodes);
    if (unlockedNodes.length === 0) return;
    const copied = unlockedNodes.map((node: any) => node.clone());
    setClipboard(copied);
  }, [selectedNodes, getUnlocked]);

  const handlePaste = useCallback(() => {
    if (clipboard.length === 0 || !canvasRef.current?.layer) return;
  
    runAsSingleHistoryStep(() => {
      const layer = canvasRef.current!.layer;
      const newSelection: Node[] = [];
  
      clipboard.forEach((nodeToPaste: any) => {
        const clone = nodeToPaste.clone();
        
        // Ensure the clone gets a new, unique ID
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}-${newSelection.length}`;
        clone.setAttrs({
          id: uniqueId,
          x: clone.x() + 20,
          y: clone.y() + 20,
        });
  
        // Re-attach interaction handlers
        attachDoubleClick(clone);
  
        layer.add(clone);
        newSelection.push(clone);
      });
  
      // Update UI
      layer.batchDraw();
      setSelectedNodes(newSelection);
      updateLayers();
    });
  }, [clipboard, canvasRef, attachDoubleClick, setSelectedNodes, updateLayers, runAsSingleHistoryStep]);


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
      if (layer) layer.draw();
    }
  }, [backgroundColor, isCanvasReady]);

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
    if (isCanvasReady) {
      setIsLoading(false);
      fitToScreen();
      window.addEventListener('resize', fitToScreen);
      return () => window.removeEventListener('resize', fitToScreen);
    }
  }, [isCanvasReady, fitToScreen]);

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
    setFrameDialogOpen, isMaskDialogOpen, setMaskDialogOpen, isClipartDialogOpen, setClipartDialogOpen, editingShapeNode, 
    setEditingShapeNode, editingFrameNode, setEditingFrameNode, editingMaskNode, setEditingMaskNode, editingTextNode, 
    setEditingTextNode,
    canvasSize, setCanvasSize, backgroundColor, setBackgroundColor, clipboard,
    canvasScale, canvasPosition, setCanvasPosition, zoomIn, zoomOut, fitToScreen, handleZoomChange,
    updateLayers, deselectNodes, handleSave, handleMoveNode, handleAlign, handleOpacityChange, handleFlip,
    handleColorUpdate, handleSelectItem, addImageFromComputer, handleAddShape, handleUpdateShape, handleAddOrUpdateText,
    handleAddFrame, handleUpdateFrame, handleAddMask, handleUpdateMask, handleAddClipart, addImageToMask, handleMaskImageZoom,
    handleMaskImageReset, handleMaskImagePan, handleAnimationChange, playAllAnimations,
    handleClipartPartColorChange,
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
