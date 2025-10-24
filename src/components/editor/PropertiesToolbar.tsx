
'use client';

import React, { useEffect, useState } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import ObjectPropertiesPanel from './ObjectPropertiesPanel';
import ZoomControls from './ZoomControls';
import BackgroundImagePanel from './BackgroundImagePanel';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Menu, RotateCw, Scaling } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

const PropertiesToolbar = () => {
  const {
    selectedNodes,
    handleAlign,
    handleOpacityChange,
    handleScaleChange,
    handleRotationChange,
    handleFlip,
    handleColorUpdate,
    handleTextUpdate,
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
    canvasRef,
  } = useCanvas();

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const hasSelection = selectedNodes.length > 0;
  const selectedNode = hasSelection ? selectedNodes[0] : null;

  useEffect(() => {
    if (selectedNode && canvasRef.current?.stage) {
      const canvasWidth = canvasRef.current.stage.width();
      const nodeWidth = selectedNode.getClientRect({ skipTransform: false }).width;
      
      const currentScale = selectedNode.scaleX();
      
      if (nodeWidth > 0 && canvasWidth > 0) {
        const baseScaleForFullWidth = canvasWidth / nodeWidth;
        const displayPercent = currentScale / baseScaleForFullWidth;
        setScale(displayPercent);
      } else {
        setScale(1);
      }
      
      setRotation(selectedNode.rotation() ?? 0);
    } else {
      setScale(1);
      setRotation(0);
    }
  }, [selectedNode, canvasRef]);

  const handleScaleSliderChange = (newScalePercent: number) => {
    setScale(newScalePercent);
    handleScaleChange(newScalePercent);
  };
  
  const handleRotationSliderChange = (newRotation: number) => {
    setRotation(newRotation);
    handleRotationChange(newRotation);
  };

  return (
    <div className="toolbar mt-4 w-full h-auto py-2 flex flex-row items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-1">
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

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!hasSelection}><Scaling size={16} /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="scale-slider" className="text-xs">Scale ({Math.round(scale * 100)}%)</Label>
                    <Slider
                        id="scale-slider"
                        min={0.01}
                        max={2}
                        step={0.01}
                        value={[scale]}
                        onValueChange={(val) => handleScaleSliderChange(val[0])}
                        disabled={!hasSelection}
                    />
                </div>
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!hasSelection}><RotateCw size={16} /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="rotation-slider" className="text-xs">Rotation ({Math.round(rotation)}°)</Label>
                    <Slider
                        id="rotation-slider"
                        min={0}
                        max={360}
                        step={1}
                        value={[rotation]}
                        onValueChange={(val) => handleRotationSliderChange(val[0])}
                        disabled={!hasSelection}
                    />
                </div>
            </PopoverContent>
        </Popover>

      </div>
      
      <div className="w-full max-w-full overflow-x-auto properties-scrollbar flex-grow whitespace-nowrap">
         <ObjectPropertiesPanel
          selectedNodes={selectedNodes}
          onAlign={handleAlign}
          onOpacityChange={handleOpacityChange}
          onFlip={handleFlip}
          onColorChange={handleColorUpdate}
          onTextUpdate={handleTextUpdate}
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
