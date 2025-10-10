
// src/hooks/useSelection.ts
import { useEffect } from 'react';

export function useSelection({
  stageRef,
  layerRef,
  transformerRef,
  selectedNodes,
  saveState,
}: any) {
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
