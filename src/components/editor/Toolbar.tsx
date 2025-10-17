'use client';

import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Plus, Trash2, Save, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';

const Toolbar = () => {
  const {
    setAddItemDialogOpen,
    deselectNodes,
    selectedNodes,
    handleSave,
    handleZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    handleDelete,
    isSelectionLocked,
    isAnySelectedLocked, // 👈 get this from context
    toggleLock,
  } = useCanvas();

  const hasSelection = selectedNodes.length > 0;

  return (
    <div className="toolbar" onClick={(e) => e.stopPropagation()}>
      {/* Add / Insert */}
      <div className="toolbar-section">
        <Button
          variant="default"
          size="sm"
          aria-label="Add"
          title="Add"
          onClick={() => {
            setAddItemDialogOpen(true);
            deselectNodes();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" />

      {/* Delete */}
      <div className="toolbar-section">
        <Button
          variant={hasSelection ? 'destructive' : 'ghost'}
          size="icon"
          disabled={!hasSelection}
          aria-label="Delete selected"
          title={hasSelection ? 'Delete selected' : 'Nothing selected'}
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" />

      {/* Lock / Unlock */}
      <div className="toolbar-section">
        <Button
          variant="ghost"
          size="icon"
          disabled={!hasSelection}
          aria-label={isSelectionLocked ? 'Unlock selected' : 'Lock selected'}
          title={
            isSelectionLocked
              ? 'Unlock selected (all selected are locked)'
              : isAnySelectedLocked
              ? 'Some selected are locked'
              : 'Lock selected'
          }
          onClick={toggleLock}
          className={
            isAnySelectedLocked
              ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
              : undefined
          }
        >
          {isSelectionLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </Button>
      </div>

      <Separator orientation="vertical" />

      {/* Undo / Redo */}
      <div className="toolbar-section">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo}
          aria-label="Undo"
          title={canUndo ? 'Undo' : 'Nothing to undo'}
          onClick={undo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo}
          aria-label="Redo"
          title={canRedo ? 'Redo' : 'Nothing to redo'}
          onClick={redo}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" />

      {/* Zoom */}
      <div className="toolbar-section">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => handleZoom('in')}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => handleZoom('out')}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" />

      {/* Save / Export */}
      <div className="toolbar-section">
        <Button
          variant="default"
          size="sm"
          aria-label="Save"
          title="Save"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
