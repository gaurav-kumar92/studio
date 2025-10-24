
'use client';

import React from 'react';
import {
  Undo,
  Redo,
  Plus,
  Trash2,
  Save,
  Lock,
  Unlock,
  Copy,
  ClipboardPaste,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';
import ZoomControls from './ZoomControls';

const Toolbar = () => {
  const {
    setAddItemDialogOpen,
    deselectNodes,
    selectedNodes,
    handleSave,
    undo,
    redo,
    canUndo,
    canRedo,
    handleDelete,
    isSelectionLocked,
    isAnySelectedLocked,
    toggleLock,
    handleCopy,
    handlePaste,
    clipboard,
    playAllAnimations,
  } = useCanvas();

  const hasSelection = selectedNodes.length > 0;
  const canPaste = clipboard.length > 0;

  return (
    <div className="toolbar flex-col items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
      {/* Top Row: Add, Zoom, Save */}
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
        <Separator orientation="vertical" />
        <ZoomControls />
        <Separator orientation="vertical" />
        <Button variant="default" size="sm" aria-label="Save" title="Save" onClick={handleSave}>
          <Save className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" />
        <Button variant="default" size="sm" aria-label="Play Animations" title="Play Animations" onClick={playAllAnimations}>
          <Play className="h-4 w-4" />
        </Button>
      </div>

      {/* Bottom Row: History, Edit */}
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
        <Separator orientation="vertical" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          disabled={!hasSelection}
          aria-label="Copy Selection"
          title={hasSelection ? "Copy Selection" : "Nothing selected"}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePaste}
          disabled={!canPaste}
          aria-label="Paste"
          title={canPaste ? "Paste" : "Clipboard is empty"}
        >
          <ClipboardPaste className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" />
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
          {isSelectionLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>
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
    </div>
  );
};

export default Toolbar;
