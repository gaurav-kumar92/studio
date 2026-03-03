'use client';

import { useCallback } from 'react';

export function useGrouping({
    canvasRef,
    selectedNodes,
    setSelectedNodes,
    setMultiSelectMode,
    updateLayers,
    attachDoubleClick,
    runAsSingleHistoryStep,
  }) {
    // ---- GROUP ----
  const handleGroup = useCallback(() => {
    if (
      selectedNodes.length < 2 ||
      selectedNodes.some((node) => node.getAttr('isLocked')) ||
      !canvasRef.current?.layer
    )
      return;

      runAsSingleHistoryStep(() => {
        const layer = canvasRef.current!.layer;
  
        let minX = Infinity,
          minY = Infinity;
        let maxX = -Infinity,
          maxY = -Infinity;
  
        selectedNodes.forEach((node) => {
          const box = node.getClientRect({ relativeTo: layer });
          minX = Math.min(minX, box.x);
          minY = Math.min(minY, box.y);
          maxX = Math.max(maxX, box.x + box.width);
          maxY = Math.max(maxY, box.y + box.height);
        });

        const uniqueId = `node-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`;
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

          selectedNodes.forEach((node) => {
            const box = node.getClientRect({ relativeTo: layer });
            const currentX = node.x();
            const currentY = node.y();
    
            const offsetX = box.x - currentX;
            const offsetY = box.y - currentY;
    
            node.moveTo(group);
    
            node.position({
              x: box.x - minX - offsetX,
              y: box.y - minY - offsetY,
            });

            
        node.draggable(false);
    });

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
    attachDoubleClick,
  ]);
  // ---- UNGROUP ----
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
        const nodesToSelect: any[] = [];
  
        children.forEach((child: any) => {
          const absPos = child.getAbsolutePosition();
  
          child.moveTo(layer);
          child.setAbsolutePosition(absPos);
          child.draggable(true);
          child.listening(true);
  
          nodesToSelect.push(child);
        });
  
        group.destroy();
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
    return {
        handleGroup,
        handleUngroup,
      };
    }