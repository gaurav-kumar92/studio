
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Canvas from '@/components/editor/Canvas';
import ShapeDialog from '@/components/editor/ShapeDialog';
import FrameDialog from '@/components/editor/FrameDialog';
import MaskDialog from '@/components/editor/MaskDialog';
import AddItemDialog from '@/components/editor/AddItemDialog';
import LayersPanel from '@/components/editor/LayersPanel';
import PropertiesToolbar from '@/components/editor/PropertiesToolbar';
import {
  CanvasProvider,
  useCanvas,
} from '@/contexts/CanvasContext';
import Toolbar from '@/components/editor/Toolbar';
import ClipartDialog from '@/components/editor/ClipartDialog';
import OnCanvasTextEditor from '@/components/editor/OnCanvasTextEditor';
import CanvasSizeSelector from '@/components/editor/CanvasSizeSelector';
import BackgroundColorPicker from '@/components/editor/BackgroundColorPicker';
import BackgroundImagePicker from '@/components/editor/BackgroundImagePicker';

declare global {
  interface Window {
    Konva: any;
  }
}

function Editor() {
  const {
    canvasRef,
    isCanvasReady,
    konvaObjects,
    selectedNodes,
    setSelectedNodes,
    isMultiSelectMode,
    isAddItemDialogOpen,
    setAddItemDialogOpen,
    isShapeDialogOpen,
    setShapeDialogOpen,
    isFrameDialogOpen,
    setFrameDialogOpen,
    isMaskDialogOpen,
    setMaskDialogOpen,
    isClipartDialogOpen,
    setClipartDialogOpen,
    editingShapeNode,
    editingFrameNode,
    editingMaskNode,
    editingTextNode,
    setEditingTextNode,
    handleAddShape,
    handleUpdateShape,
    handleAddOrUpdateText,
    handleAddFrame,
    handleUpdateFrame,
    handleAddMask,
    handleUpdateMask,
    handleAddClipart,
    handleSelectItem,
    handleMoveNode,
    isLoading,
    canvasSize,
    setCanvasSize,
    backgroundColor,
    setBackgroundColor,
    backgroundImage,
  } = useCanvas();

  const isCircular = canvasSize.endsWith('-circle');
  const sizeString = canvasSize.split('-')[0];

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/konva@9.3.6/konva.min.js"
        strategy="beforeInteractive"
      />
      {isLoading || !isCanvasReady ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading Editor...</p>
        </div>
      ) : null}
      <div id="editor-ui">
        <div className="editor-main-column">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CanvasSizeSelector value={canvasSize} onChange={setCanvasSize} />
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <BackgroundImagePicker />
          </div>
          <Toolbar />
          <Canvas
            ref={canvasRef}
            canvasSize={sizeString!}
            isCircular={isCircular!}
            backgroundImage={backgroundImage}
          />
          {editingTextNode && (
            <OnCanvasTextEditor
              node={editingTextNode}
              onClose={() => setEditingTextNode(null)}
              onUpdate={handleAddOrUpdateText}
            />
          )}
          <PropertiesToolbar />
        </div>

        <LayersPanel
          layers={konvaObjects}
          selectedNodes={selectedNodes}
          onSelectNode={(id) => {
            const node = canvasRef.current?.layer.findOne(`#${id}`);
            if (node) {
              if (isMultiSelectMode) {
                const isSelected = selectedNodes.some((n) => n.id() === node.id());
                if (isSelected) {
                  setSelectedNodes(selectedNodes.filter((n) => n.id() !== node.id()));
                } else {
                  setSelectedNodes([...selectedNodes, node]);
                }
              } else {
                setSelectedNodes([node]);
              }
            }
          }}
          onMoveNode={handleMoveNode}
        />

        <AddItemDialog
          isOpen={isAddItemDialogOpen}
          onClose={() => setAddItemDialogOpen(false)}
          onSelectItem={handleSelectItem}
        />

        <ShapeDialog
          isOpen={isShapeDialogOpen}
          onClose={() => setShapeDialogOpen(false)}
          onAddShape={handleAddShape}
          onUpdateShape={handleUpdateShape}
          editingNode={editingShapeNode}
        />

        <FrameDialog
          isOpen={isFrameDialogOpen}
          onClose={() => setFrameDialogOpen(false)}
          onAddFrame={handleAddFrame}
          onUpdateFrame={handleUpdateFrame}
          editingNode={editingFrameNode}
        />

        <MaskDialog
          isOpen={isMaskDialogOpen}
          onClose={() => setMaskDialogOpen(false)}
          onAddMask={handleAddMask}
          onUpdateMask={handleUpdateMask}
          editingNode={editingMaskNode}
        />

        <ClipartDialog
          isOpen={isClipartDialogOpen}
          onClose={() => setClipartDialogOpen(false)}
          onAddClipart={handleAddClipart}
        />
      </div>
    </>
  );
}

export default function KonvaEditor() {
  return (
    <CanvasProvider>
      <Editor />
    </CanvasProvider>
  );
}
