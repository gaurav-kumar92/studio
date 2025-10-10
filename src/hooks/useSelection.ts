
// src/hooks/useSelection.ts
import { useEffect } from 'react';

type UseSelectionProps = {
  isCanvasReady: boolean;
  canvasRef: React.RefObject<{ stage: any; layer: any; }>;
  transformerRef: React.RefObject<any>;
  isMultiSelectMode: boolean;
  selectedNodes: any[];
  setSelectedNodes: (nodes: any[]) => void;
  saveState: () => void;
};

export function useSelection({
  isCanvasReady,
  canvasRef,
  transformerRef,
  isMultiSelectMode,
  selectedNodes,
  setSelectedNodes,
  saveState,
}: UseSelectionProps) {

  // Handle click/tap events for selection
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage) return;

    const stage = canvasRef.current.stage;

    const handleStageClick = (e: any) => {
      if (window.isOpeningFileDialog) {
        return;
      }
      
      const isShiftPressed = e.evt.shiftKey;

      // If clicked on empty area, deselect all unless shift is pressed
      if (e.target === stage || e.target.hasName('background')) {
        if (!isMultiSelectMode && !isShiftPressed) {
          setSelectedNodes([]);
        }
        return;
      }

      // Find the clicked node and check if it's part of a group
      let node = e.target;
      if (
        node.parent?.hasName('circularText') ||
        node.parent?.hasName('mask') ||
        node.parent?.hasName('textGroup') ||
        node.parent?.hasName('group')
      ) {
        node = node.parent;
      }

      // Handle selection logic
      const isSelected = selectedNodes.some(n => n.id() === node.id());

      if (isMultiSelectMode || isShiftPressed) {
        if (isSelected) {
          // If already selected, remove it
          setSelectedNodes(selectedNodes.filter(n => n.id() !== node.id()));
        } else {
          // If not selected, add it to the selection
          setSelectedNodes([...selectedNodes, node]);
        }
      } else {
        // If not in multi-select mode, just select the one clicked node
        setSelectedNodes([node]);
      }
    };

    stage.on('click tap', handleStageClick);

    return () => {
      stage.off('click tap', handleStageClick);
    };

  }, [isCanvasReady, canvasRef, isMultiSelectMode, selectedNodes, setSelectedNodes]);


  // Handle transformer attachment and events
  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;

    // Destroy existing transformer
    if (transformerRef.current) {
      transformerRef.current.destroy();
      transformerRef.current = null;
    }

    // Create new transformer if there are selected nodes
    if (selectedNodes.length > 0) {
      const tr = new window.Konva.Transformer({
        nodes: selectedNodes,
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
      transformerRef.current = tr;
      
      // Save state after a transformation is complete
      tr.on('transformend', saveState);
    }
    
    layer.batchDraw();

    // No explicit cleanup for transformer.on, as it's destroyed with the transformer itself
  }, [selectedNodes, canvasRef, transformerRef, saveState]);
}
