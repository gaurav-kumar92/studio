
'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';
import CanvasSizeSelector from './CanvasSizeSelector';
import BackgroundColorPicker from './BackgroundColorPicker';
import ObjectPropertiesPanel from './ObjectPropertiesPanel';
import ZoomControls from './ZoomControls';

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
    isMultiSelectMode,
    setMultiSelectMode,
    handleGroup,
    handleUngroup,
    setSelectedNodes,
    handleAnimationChange,
    handleClipartPartColorChange,
  } = useCanvas();

  const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null;

  return (
    <div className="toolbar mt-4 w-full flex-wrap justify-center h-auto py-2">
      {/* Canvas Properties Section */}
      <div className="toolbar-section flex-col md:flex-row flex-wrap justify-center mr-2 gap-2">
         <div className="flex items-center gap-2">
          <CanvasSizeSelector
            value={canvasSize}
            onChange={setCanvasSize}
          />
          <BackgroundColorPicker
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
        </div>
        <ZoomControls />
      </div>

      <Separator orientation="vertical" className="hidden md:block" />

      {/* Conditional Separator and Object Properties */}
      {selectedNode && (
        <>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="toolbar-section flex-wrap justify-center">
            <ObjectPropertiesPanel
              selectedNodes={selectedNodes}
              onAlign={handleAlign}
              onOpacityChange={handleOpacityChange}
              onFlip={handleFlip}
              onColorChange={handleColorUpdate}
              onMaskImageZoom={handleMaskImageZoom}
              onMaskImageReset={handleMaskImageReset}
              onMaskImagePan={handleMaskImagePan}
              isMultiSelectMode={isMultiSelectMode}
              onAnimationChange={handleAnimationChange}
              onClipartPartColorChange={handleClipartPartColorChange}
              onMultiSelectToggle={() => {
                const newMode = !isMultiSelectMode;
                setMultiSelectMode(newMode);
                if (!newMode && selectedNodes.length > 1) {
                  // If exiting multi-select, keep only the last selected item
                  setSelectedNodes([selectedNodes[selectedNodes.length - 1]]);
                }
              }}
              onGroup={handleGroup}
              onUngroup={handleUngroup}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PropertiesToolbar;
