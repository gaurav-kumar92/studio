'use client';

import React from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const CanvasManager = () => {
  const {
    canvases,
    activeCanvasId,
    setActiveCanvasId,
    addNewCanvas,
    closeCanvas,
    updateCanvasState,
  } = useCanvas();

  const handleTabNameChange = (canvasId: string, newName: string) => {
    updateCanvasState(canvasId, { name: newName });
  };

  return (
    <div className="flex items-center bg-gray-200 p-1 rounded-t-lg">
      <div className="flex-grow flex items-center overflow-x-auto">
        {canvases.map((canvas, index) => (
          <div
            key={canvas.id}
            onClick={() => setActiveCanvasId(canvas.id)}
            className={`flex items-center px-3 py-1.5 rounded-t-md cursor-pointer border-b-2 ${
              activeCanvasId === canvas.id
                ? 'bg-white border-indigo-500'
                : 'bg-gray-100 border-transparent hover:bg-gray-300'
            }`}
          >
            <input
              type="text"
              value={canvas.name}
              onChange={(e) => handleTabNameChange(canvas.id, e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim() === '') {
                  handleTabNameChange(canvas.id, `Canvas ${index + 1}`);
                }
              }}
              className="bg-transparent text-sm font-medium outline-none border-none focus:ring-0 p-0"
              style={{ minWidth: '50px', maxWidth: '150px' }}
            />
            {canvases.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  closeCanvas(canvas.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => addNewCanvas()}
        title="Add New Canvas"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CanvasManager;
