
import { useEffect, useRef, useCallback } from 'react';

type UseSelectionProps = {
  isCanvasReady: boolean;
  canvasRef: React.RefObject<{ stage: any; layer: any; }>;
  isMultiSelectMode: boolean;
  selectedNodes: any[];
  setSelectedNodes: (nodes: any[]) => void;
  saveState: (command: any, before?: any[], after?: any[]) => void;
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
  const selectionBoxRef = useRef<any>();
  const beforeStateRef = useRef<any[]>([]);

  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage || !window.Konva) return;

    const stage = canvasRef.current.stage;

    // Create selection box
    selectionBoxRef.current = new window.Konva.Rect({
        fill: 'rgba(0,0,255,0.1)',
        visible: false,
    });
    canvasRef.current.layer.add(selectionBoxRef.current);

    let x1: number, y1: number, x2: number, y2: number;
    stage.on('mousedown.selection touchstart.selection', (e: any) => {
        // do nothing if we mousedown on any shape
        if (e.target !== stage) {
            return;
        }
        e.evt.preventDefault();
        const pos = stage.getPointerPosition();
        if (!pos) return;
        x1 = pos.x;
        y1 = pos.y;
        x2 = pos.x;
        y2 = pos.y;

        selectionBoxRef.current.visible(true);
        selectionBoxRef.current.width(0);
        selectionBoxRef.current.height(0);
    });

    stage.on('mousemove.selection touchmove.selection', (e: any) => {
        // do nothing if we didn't start dragging from stage
        if (!selectionBoxRef.current.visible()) {
            return;
        }
        e.evt.preventDefault();
        const pos = stage.getPointerPosition();
        if (!pos) return;
        x2 = pos.x;
        y2 = pos.y;

        selectionBoxRef.current.setAttrs({
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
        });
    });

    stage.on('mouseup.selection touchend.selection', (e: any) => {
        // do nothing if we didn't start dragging from stage
        if (!selectionBoxRef.current.visible()) {
            return;
        }
        e.evt.preventDefault();
        // update visibility in timeout to avoid checking logic in click event
        setTimeout(() => {
            selectionBoxRef.current.visible(false);
        });

        const shapes = stage.find('.shape, .textGroup, .image, .frame, .mask, .group, .circularText');
        const box = selectionBoxRef.current.getClientRect();
        const selected = shapes.filter((shape: any) =>
            window.Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        setSelectedNodes(selected);
    });

    const handleStageClick = (e: any) => {
      // if we are selecting with rect, do nothing
      if (selectionBoxRef.current.visible()) {
          return;
      }

      // if click on empty area - remove all selections
      if (e.target === stage) {
        setSelectedNodes([]);
        return;
      }

      // do nothing if clicked NOT on our shapes
      const isShape = e.target.hasName('shape') || e.target.hasName('textGroup') || e.target.hasName('image') || e.target.hasName('frame') || e.target.hasName('mask') || e.target.hasName('group') || e.target.hasName('circularText');
      if (!isShape && !(e.target.parent?.hasName('textGroup') || e.target.parent?.hasName('mask') || e.target.parent?.hasName('group') || e.target.parent?.hasName('circularText'))) {
        return;
      }
      
      let node = e.target;
      if (e.target.parent?.hasName('textGroup') || e.target.parent?.hasName('mask') || e.target.parent?.hasName('group') || e.target.parent?.hasName('circularText')) {
        node = e.target.parent;
      }
      
      const isSelected = selectedNodes.some(n => n.id() === node.id());
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey || isMultiSelectMode;

      if (!metaPressed) {
        setSelectedNodes([node]);
      } else {
        if (isSelected) {
            setSelectedNodes(selectedNodes.filter(n => n.id() !== node.id()));
        } else {
            setSelectedNodes([...selectedNodes, node]);
        }
      }
    };

    stage.on('click.selection tap.selection', handleStageClick);

    return () => {
      stage.off('click.selection tap.selection mousedown.selection touchstart.selection mousemove.selection touchmove.selection mouseup.selection touchend.selection');
    };

  }, [isCanvasReady, canvasRef, isMultiSelectMode, selectedNodes, setSelectedNodes]);

  const onTransformStart = useCallback(() => {
    beforeStateRef.current = selectedNodes.map(n => ({ id: n.id(), config: n.toObject() }));
  }, [selectedNodes]);
  
  const onTransformEnd = useCallback(() => {
    const afterState = selectedNodes.map(n => ({ id: n.id(), config: n.toObject() }));
    saveState({ type: 'UPDATE' }, beforeStateRef.current, afterState);
    beforeStateRef.current = [];
  }, [selectedNodes, saveState]);

  useEffect(() => {
    if (!canvasRef.current?.layer || !window.Konva) return;
    const layer = canvasRef.current.layer;

    transformersRef.current.forEach(tr => tr.destroy());
    transformersRef.current = [];

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
      
      node.on('dragstart transformstart', onTransformStart);
      node.on('dragend transformend', onTransformEnd);
    });
    
    layer.batchDraw();

    return () => {
      transformersRef.current.forEach(tr => tr.destroy());
      transformersRef.current = [];
      selectedNodes.forEach(node => {
        node.off('dragstart transformstart', onTransformStart);
        node.off('dragend transformend', onTransformEnd);
      });
    };
  }, [selectedNodes, canvasRef, onTransformStart, onTransformEnd]);
}
