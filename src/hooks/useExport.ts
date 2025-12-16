'use client';

import { useCallback } from 'react';
export function useExport({
    canvasRef,
    deselectNodes,
  }){
    const handleSave = useCallback(
      (
        format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
        quality: number = 1
      )=> {
        if (
          !canvasRef.current?.stage ||
          !canvasRef.current?.layer ||
          !canvasRef.current?.background
        )
          return;
          const stage = canvasRef.current.stage;
          const layer = canvasRef.current.layer;
          const background = canvasRef.current.background;
    
          // Deselect all nodes
          deselectNodes();
            // Hide transformers
      const transformers = layer.find('Transformer');
      transformers.forEach((tr: any) => tr.visible(false));
      layer.batchDraw();
      setTimeout(() => {
        const canvasWidth = background.width();
        const canvasHeight = background.height();

        const tempStage = new window.Konva.Stage({
          container: document.createElement('div'),
          width: canvasWidth,
          height: canvasHeight,
        });
        const tempLayer = new window.Konva.Layer();
        tempStage.add(tempLayer);

        // Clone background
        const bgClone = background.clone();
        bgClone.position({ x: 0, y: 0 });
        tempLayer.add(bgClone);
        // Clone objects
        layer.getChildren().forEach((child: any) => {
            if (child === background) return;
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
              pixelRatio: 3,
            });
            filename = 'konva-design-print.png';
        } else if (format === 'jpg') {
          dataURL = tempStage.toDataURL({
            mimeType: 'image/jpeg',
            quality,
          });
          filename = 'konva-design.jpg';
        } else {
          dataURL = tempStage.toDataURL({
            mimeType: 'image/png',
            quality,
            pixelRatio: quality === 1 ? 2 : 1,
          });
          filename = 'konva-design.png';
        }

        tempStage.destroy();

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        transformers.forEach((tr: any) => tr.visible(true));
        layer.batchDraw();
      }, 100);
    },
    [canvasRef, deselectNodes]
  );

  return { handleSave };
}