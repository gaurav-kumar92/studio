// src/hooks/useSelection.ts
import { useEffect } from 'react';

export function useSelection({
  stageRef,
  layerRef,
  transformerRef,
  isMultiSelectMode,
  selectedNodes,
  setSelectedNodes,
  saveState,
}: any) {
  useEffect(() => {
    if (!stageRef.current || !layerRef.current) return;

    const stage = stageRef.current;
    const layer = layerRef.current;

    // Handle click/tap selection
    const handleSelect = (e: any) => {
      // Ignore clicks on empty area
      if (e.target === stage) return;

      const node = e.target;

      // Prevent selecting the stage or background layer
      if (!node || node === stage || node.getName() === 'canvas') return;

      if (isMultiSelectMode) {
        const isSelected = selectedNodes.some((n: any) => n.id() === node.id());
          if (isSelected) {
            setSelectedNodes((prev: any) => prev.filter((n: any) => n.id() !== node.id()));
            } else {
          setSelectedNodes((prev: any) => [...prev, node]);
        }
      } else {
        setSelectedNodes([node]);
      }
    };

    stage.on('click tap', handleSelect);

    return () => {
      stage.off('click tap', handleSelect);
    };
  }, [stageRef, layerRef, isMultiSelectMode, selectedNodes]);

  // Handle transformer logic
  useEffect(() => {
    if (!layerRef.current) return;
    const layer = layerRef.current;

    if (transformerRef.current) transformerRef.current.destroy();

    if (selectedNodes.length > 0) {
      const tr = new window.Konva.Transformer({
        nodes: selectedNodes,
        keepRatio: true,
        rotateEnabled: true,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      });

      layer.add(tr);
      transformerRef.current = tr;
      layer.batchDraw();
    }

    return () => {
      if (transformerRef.current) transformerRef.current.destroy();
    };
  }, [selectedNodes, layerRef, saveState]);
}
