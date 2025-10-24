
'use client';

import React from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import ObjectPropertiesPanel from './ObjectPropertiesPanel';
import ZoomControls from './ZoomControls';
import BackgroundImagePanel from './BackgroundImagePanel';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

const PropertiesToolbar = () => {
  const {
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
    backgroundImage,
    handleBackgroundImageZoom,
    handleBackgroundImagePan,
    handleBackgroundImageReset,
  } = useCanvas();

  return (
    <div className="toolbar mt-4 w-full h-auto py-2 flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-2">
        <ZoomControls />
        {backgroundImage && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" title="Edit Background Image">
                <Menu size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <BackgroundImagePanel
                onZoom={handleBackgroundImageZoom}
                onPan={handleBackgroundImagePan}
                onReset={handleBackgroundImageReset}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="w-full max-w-full overflow-x-auto properties-scrollbar">
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
      </div>
    </div>
  );
};

export default PropertiesToolbar;
