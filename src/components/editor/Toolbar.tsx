'use client';

import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Plus, Trash2, Save, Group, Ungroup, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';

const Toolbar = () => {
  const { 
    setAddItemDialogOpen, 
    deselectNodes, 
    selectedNodes,
    updateLayers,
    handleSave,
    handleZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    isMultiSelectMode,
    setMultiSelectMode,
    handleGroup,
    handleUngroup,
    setSelectedNodes,
  } = useCanvas();

  const handleMultiSelectToggle = () => {
    const newMode = !isMultiSelectMode;
    setMultiSelectMode(newMode);
    // When exiting multi-select mode, clear the selection
    if (!newMode) {
      setSelectedNodes([]);
    }
  };

  const isGroupSelected = selectedNodes.length === 1 && selectedNodes[0]?.name() === 'group';

  return (
    <div className="toolbar">
      {/* "Add Item" button section */}
      <div className="toolbar-section">
      
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => {
            setAddItemDialogOpen(true);
            deselectNodes();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

       {/* Multi-Select Toggle */}
       <div className="toolbar-section">
        <Button
          variant={isMultiSelectMode ? "destructive" : "ghost"}
          size="icon"
          onClick={handleMultiSelectToggle}
          title="Select Multiple"
        >
          <ListPlus className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

      {/* Group/Ungroup buttons */}
      <div className="toolbar-section">
        <Button variant="ghost" size="icon" onClick={handleGroup} disabled={selectedNodes.length < 2}>
            <Group className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleUngroup} disabled={!isGroupSelected}>
            <Ungroup className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

      {/* Delete button section */}
      <div className="toolbar-section">
        <Button
          variant={selectedNodes.length > 0 ? "destructive" : "ghost"}
          size="icon"
          disabled={selectedNodes.length === 0}
          onClick={() => {
            if (selectedNodes.length > 0) {
              selectedNodes.forEach(node => node.destroy());
              deselectNodes();
              updateLayers();
              saveState();
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
