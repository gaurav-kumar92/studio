
'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import Canvas from '@/components/editor/Canvas';
import ShapeDialog from '@/components/editor/ShapeDialog';
import FrameDialog from '@/components/editor/FrameDialog';
import MaskDialog from '@/components/editor/MaskDialog';
import AddItemDialog from '@/components/editor/AddItemDialog';
import TextDialog from '@/components/editor/TextDialog';
import LayersPanel from '@/components/editor/LayersPanel';
import PropertiesToolbar from '@/components/editor/PropertiesToolbar';
import { CanvasProvider, useCanvas } from '@/contexts/CanvasContext';
import Toolbar from '@/components/editor/Toolbar'; 

declare global {
  interface Window {
    Konva: any;
  }
}

function Editor() {
  const {
    canvasRef,
    canvasSize,
    isCanvasReady,
    setCanvasReady,
    konvaObjects,
    selectedNodes,
    setSelectedNodes,
    isMultiSelectMode,
    isAddItemDialogOpen,
    setAddItemDialogOpen,
    isShapeDialogOpen,
    setShapeDialogOpen,
    isTextDialogOpen,
    setTextDialogOpen,
    isFrameDialogOpen,
    setFrameDialogOpen,
    isMaskDialogOpen,
    setMaskDialogOpen,
    editingShapeNode,
    editingFrameNode,
    editingMaskNode,
    editingTextNode,
    handleAddShape,
    handleUpdateShape,
    handleAddOrUpdateText,
    handleAddFrame,
    handleUpdateFrame,
    handleAddMask,
    handleUpdateMask,
    handleSelectItem,
    handleMoveNode,
  } = useCanvas();

  const isCircular = canvasSize.endsWith('-circle');
  const sizeString = canvasSize.split('-')[0];

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Konva) {
      if(canvasRef.current) {
        setCanvasReady(true);
      }
    }
  }, [canvasRef, setCanvasReady]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/konva@9.3.6/konva.min.js"
        strategy="lazyOnload"
        onLoad={() => {
            if (typeof window !== 'undefined' && (window as any).Konva) {
              setCanvasReady(true)
            }
        }}
      />
      {!isCanvasReady && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      <main>
        <div id="editor-ui">
            <div className="editor-main-column">
                <h2 className="text-xl font-semibold text-center mb-4">Canvas Editor</h2>
                <Toolbar />
                <Canvas 
                    ref={canvasRef} 
                    canvasSize={sizeString}
                    isCircular={isCircular}
                    onReady={() => setCanvasReady(true)}
                />
                
                <PropertiesToolbar />

            </div>

            <LayersPanel 
                layers={konvaObjects}
                selectedNodes={selectedNodes}
                onSelectNode={(id) => {
                    const node = canvasRef.current?.layer.findOne(`#${id}`);
                    if (node) {
                      if (isMultiSelectMode) {
                        const isSelected = selectedNodes.some(n => n.id() === node.id());
                        if (isSelected) {
                          setSelectedNodes(selectedNodes.filter(n => n.id() !== node.id()));
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

        <TextDialog
            isOpen={isTextDialogOpen}
            onClose={() => setTextDialogOpen(false)}
            onAddOrUpdateText={handleAddOrUpdateText}
            editingNode={editingTextNode}
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

        </div>
      </main>
    </>
  );
}


export default function KonvaEditor() {
    return (
        <CanvasProvider>
            <Editor />
        </CanvasProvider>
    )
}
