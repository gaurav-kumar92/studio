
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
    isMultiSelectMode,
    setMultiSelectMode,
    handleGroup,
    handleUngroup,
    setSelectedNodes,
  } = useCanvas();

  const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null;

  return (
    <div className="toolbar mt-4 w-full flex-wrap justify-center h-auto py-2">
      {/* Canvas Properties Section */}
      <div className="toolbar-section mr-2">
        <CanvasSizeSelector
          value={canvasSize}
          onChange={setCanvasSize}
        />
        <div className="ml-2">
        <BackgroundColorPicker
          value={backgroundColor}
          onChange={setBackgroundColor}
        />
        </div>
      </div>

      {/* Conditional Separator and Object Properties */}
      {selectedNode && (
        <>
          <Separator orientation="vertical" />
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
