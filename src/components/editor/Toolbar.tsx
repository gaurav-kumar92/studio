'use client';

import React from 'react';
import { Undo, Redo, ZoomIn, ZoomOut, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';

const Toolbar = () => {
  const { 
    setAddItemDialogOpen, 
    deselectNode, 
    selectedNode, 
    updateLayers 
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

      {/* Delete button section */}
      <div className="toolbar-section">
        <Button
          variant={selectedNode ? "destructive" : "outline"}
          size="icon"
          disabled={!selectedNode}
          onClick={() => {
            if (selectedNode) {
              selectedNode.destroy();
              deselectNode();
              updateLayers();
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />
        

      {/* Existing Undo/Redo buttons */}
      <div className="toolbar-section">
        <Button variant="ghost" size="icon" disabled>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />

      {/* Existing Zoom buttons */}
      <div className="toolbar-section">
        <Button variant="ghost" size="icon" disabled>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
