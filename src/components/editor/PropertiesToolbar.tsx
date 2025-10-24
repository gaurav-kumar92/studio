
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
    <div className="toolbar mt-4 w-full h-auto py-2 flex flex-col items-center justify-center gap-4">
      {/* Top section: Always visible canvas controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        <CanvasSizeSelector value={canvasSize} onChange={setCanvasSize} />
        <BackgroundColorPicker
          value={backgroundColor}
          onChange={setBackgroundColor}
        />
        <ZoomControls />
      </div>

      {/* Bottom section: Conditional object properties */}
      {selectedNode && (
        <>
          <Separator
            orientation="horizontal"
            className="w-4/5"
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
