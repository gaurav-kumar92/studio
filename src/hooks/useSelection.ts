
import { useEffect, useRef } from 'react';

type UseSelectionProps = {
  isCanvasReady: boolean;
  canvasRef: React.RefObject<{ stage: any; layer: any; }>;
  isMultiSelectMode: boolean;
  selectedNodes: any[];
  setSelectedNodes: (nodes: any[]) => void;
  saveState: () => void;
};

export function useSelection({
  isCanvasReady,
  canvasRef,
  isMultiSelectMode,
  selectedNodes,
  setSelectedNodes,
  saveState,
}: UseSelectionProps) {

  const transformersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage) return;

    const stage = canvasRef.current.stage;

    const handleStageClick = (e: any) => {
      const isShiftPressed = e.evt.shiftKey;

      if (e.target === stage || e.target.hasName('background')) {
        if (!isMultiSelectMode && !isShiftPressed) {
          setSelectedNodes([]);
        }
        return;
      }

      let node = e.target;
      if (
        node.parent?.hasName('circularText') ||
        node.parent?.hasName('mask') ||
        node.parent?.hasName('textGroup') ||
        node.parent?.hasName('group')
      ) {
        node = node.parent;
      }

      const isSelected = selectedNodes.some(n => n.id() === node.id());

      if (isMultiSelectMode || isShiftPressed) {
        if (isSelected) {
          setSelectedNodes(selectedNodes.filter(n => n.id() !== node.id()));
        } else {
          setSelectedNodes([...selectedNodes, node]);
        }
      } else {
        setSelectedNodes([node]);
      }
    };

    stage.on('click tap', handleStageClick);

    return () => {
      stage.off('click tap', handleStageClick);
    };

  }, [isCanvasReady, canvasRef, isMultiSelectMode, selectedNodes, setSelectedNodes]);


  useEffect(() => {
    if (!canvasRef.current?.layer || !window.Konva) return;
    const layer = canvasRef.current.layer;

    // Destroy all existing transformers
    transformersRef.current.forEach(tr => tr.destroy());
    transformersRef.current = [];

    // Create a new transformer for each selected node
    selectedNodes.forEach(node => {
      const tr = new window.Konva.Transformer({
        nodes: [node],
        name: 'Transformer',
        keepRatio: true,
        rotateEnabled: true,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        boundBoxFunc: (oldBox: any, newBox: any) => {
          if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
            return oldBox;
          }
          return newBox;
        },
      });

      layer.add(tr);
      transformersRef.current.push(tr);
      
      tr.on('transformend', saveState);
    });
    
    layer.batchDraw();

    return () => {
      transformersRef.current.forEach(tr => tr.destroy());
      transformersRef.current = [];
    };
  }, [selectedNodes, canvasRef, saveState]);
}

    