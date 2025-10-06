'use client';

import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';
import { ListPlus } from 'lucide-react';

const Toolbar = () => {
  const { 
    setAddItemDialogOpen, 
    deselectNode, 
    selectedNode, 
    updateLayers,
    handleSave,
    handleZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    
  } = useCanvas();

  return (
    <div className="toolbar">
      {/* "Add Item" button section */}
      <div className="toolbar-section">
      
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => {
            setAddItemDialogOpen(true);
            deselectNode();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

      {/* Delete button section - UPDATED to include saveState */}
      <div className="toolbar-section">
        <Button
          variant={selectedNode ? "destructive" : "ghost"}
          size="icon"
          disabled={!selectedNode}
          onClick={() => {
            if (selectedNode) {
              selectedNode.destroy();
              deselectNode();
              updateLayers();
              saveState(); // ADD THIS LINE - saves state after deletion
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

      {/* Undo/Redo buttons */}
      <div className="toolbar-section">
        <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

      {/* Zoom buttons */}
      <div className="toolbar-section">
        <Button variant="ghost" size="icon" onClick={() => handleZoom('in')}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleZoom('out')}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

      {/* Save button section */}
      <div className="toolbar-section">
        <Button variant="default" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;