
'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';
import CanvasSizeSelector from './CanvasSizeSelector';
import BackgroundColorPicker from './BackgroundColorPicker';
import ObjectPropertiesPanel from './ObjectPropertiesPanel';

const PropertiesToolbar = () => {
  const {
    canvasSize,
    setCanvasSize,
    backgroundColor,
    setBackgroundColor,
    selectedNodes,
    handleAlign,
    handleOpacityChange,
    handleFlip,
    handleColorUpdate,
    handleMaskImageZoom,
    handleMaskImageReset,
    handleMaskImagePan,
  } = useCanvas();

  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  return (
    <div className="toolbar mt-4 w-full flex-wrap justify-center h-auto py-2">
      {/* Canvas Properties Section */}
      <div className="toolbar-section">
        <CanvasSizeSelector value={canvasSize} onChange={setCanvasSize} />
        <BackgroundColorPicker value={backgroundColor} onChange={setBackgroundColor} />
      </div>
      
      {/* Conditional Separator and Object Properties */}
      {selectedNode && (
        <>
          <Separator orientation="vertical" />
          <div className="toolbar-section flex-wrap justify-center">
            <ObjectPropertiesPanel
              selectedNode={selectedNode}
              onAlign={handleAlign}
              onOpacityChange={handleOpacityChange}
              onFlip={handleFlip}
              onColorChange={handleColorUpdate}
              onMaskImageZoom={handleMaskImageZoom}
              onMaskImageReset={handleMaskImageReset}
              onMaskImagePan={handleMaskImagePan}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PropertiesToolbar;

    