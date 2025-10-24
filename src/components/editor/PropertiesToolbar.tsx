
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
    <div className="toolbar mt-4 w-full h-auto py-2 flex flex-col lg:flex-row items-center justify-center gap-4">
      {/* Canvas Properties Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <CanvasSizeSelector value={canvasSize} onChange={setCanvasSize} />
        <BackgroundColorPicker
          value={backgroundColor}
          onChange={setBackgroundColor}
        />
        <ZoomControls />
      </div>

      {/* Conditional Separator and Object Properties */}
      {selectedNode && (
        <>
          <Separator
            orientation="vertical"
            className="hidden lg:block h-6 mx-2"
          />
          <Separator
            orientation="horizontal"
            className="block lg:hidden w-4/5 my-2"
          />
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
                setSelectedNodes([selectedNodes[selectedNodes.length - 1]]);
              }
            }}
            onGroup={handleGroup}
            onUngroup={handleUngroup}
          />
        </>
      )}
    </div>
  );
};

export default PropertiesToolbar;
