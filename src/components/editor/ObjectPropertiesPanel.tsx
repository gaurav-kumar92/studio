
'use client';

import React, { useEffect } from 'react';
import ColorPropertiesPanel from './ColorPropertiesPanel';
import { ZoomIn, ZoomOut, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Menu, Group, Ungroup, ListPlus, Sparkles, Palette } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import AnimationPanel from './AnimationPanel';
import ClipartPropertiesPanel from './ClipartPropertiesPanel';

type ObjectPropertiesPanelProps = {
  selectedNodes: any[];
  onAlign: (position: string) => void;
  onOpacityChange: (opacity: number) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onColorChange: (config: any) => void;
  onMaskImageZoom: (direction: 'in' | 'out') => void;
  onMaskImageReset: () => void;
  onMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isMultiSelectMode: boolean;
  onMultiSelectToggle: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAnimationChange: (animation: any) => void;
  onClipartPartColorChange: (partName: string, color: string) => void;
};

const ObjectPropertiesPanel: React.FC<ObjectPropertiesPanelProps> = ({
  selectedNodes,
  onAlign,
  onOpacityChange,
  onFlip,
  onColorChange,
  onMaskImageZoom,
  onMaskImageReset,
  onMaskImagePan,
  isMultiSelectMode,
  onMultiSelectToggle,
  onGroup,
  onUngroup,
  onAnimationChange,
  onClipartPartColorChange,
}) => {
  const [opacity, setOpacity] = React.useState(1);
  
  const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null;

  useEffect(() => {
    if (selectedNode) {
      setOpacity(selectedNode.opacity() ?? 1);
    }
  }, [selectedNode]);
  
  if (!selectedNode) {
    return null;
  }
  
  const handleOpacitySliderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);
    onOpacityChange(newOpacity);
  };
  
  const isClipart = selectedNodes.length === 1 && selectedNode.hasName('clipart');
  const canHaveColor = selectedNodes.length === 1 && (selectedNode.hasName('shape') || selectedNode.hasName('textGroup') || selectedNode.hasName('circularText')|| selectedNode.hasName('frame'));
  const isLineOrCurve = selectedNodes.length === 1 && (selectedNode.getAttr('data-type') === 'line' || selectedNode.getAttr('data-type') === 'curve' || selectedNode.getAttr('data-type') === 'arrow'|| selectedNode.hasName('frame'));
  const isMask = selectedNodes.length === 1 && selectedNode.hasName('mask');
  const maskHasImage = isMask && selectedNode.findOne('.mask-image');
  const isGroupSelected = selectedNodes.length === 1 && selectedNodes[0]?.hasName('group');

  const getFillColor = () => {
    if (typeof selectedNode.fill === 'function') {
      return selectedNode.fill();
    }
    const textChild = selectedNode.findOne?.('Text, .mainChar');
    if (textChild && typeof textChild.fill === 'function') {
      return textChild.fill();
    }
    return null;
  };

  const currentColor = canHaveColor && (selectedNode.getAttr('data-is-gradient') 
    ? 'linear-gradient(to right, #3b82f6, #a855f7)'
    : selectedNode.getAttr('data-solid-color') || (isLineOrCurve ? selectedNode.stroke() : getFillColor()) || '#000000');

  return (
    <div id="object-properties" className="flex items-center justify-center gap-2 flex-wrap">
       <Button
          variant={isMultiSelectMode ? "destructive" : "ghost"}
          size="icon"
          onClick={onMultiSelectToggle}
          title={isMultiSelectMode ? "Exit Multi-Select" : "Select Multiple"}
        >
          <ListPlus className="h-4 w-4" />
        </Button>

        {selectedNodes.length > 1 && (
            <Button variant="ghost" size="icon" onClick={onGroup} title="Group Items">
                <Group className="h-4 w-4" />
            </Button>
        )}
        {isGroupSelected && (
            <Button variant="ghost" size="icon" onClick={onUngroup} title="Ungroup Items">
                <Ungroup className="h-4 w-4" />
            </Button>
        )}

      {canHaveColor && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 border">
              <div className="h-5 w-5 rounded" style={{ background: currentColor }}></div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
             <ColorPropertiesPanel 
                selectedNode={selectedNode}
                onColorChange={onColorChange}
                isStroke={isLineOrCurve}
            />
          </PopoverContent>
        </Popover>
      )}

      {isClipart && (
         <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <Palette className="h-4 w-4 mr-2" /> Colors
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <ClipartPropertiesPanel />
          </PopoverContent>
        </Popover>
      )}

      <Separator orientation="vertical" />
      
      <div className="flex items-center gap-1">
        <button onClick={() => onAlign('left')} className="align-btn" title="Align Left"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="3" y2="12"></line><line x1="5" y1="5" x2="5" y2="19"></line><rect y="5" x="9" width="10" height="14" rx="2"></rect></svg></button>
        <button onClick={() => onAlign('center')} className="align-btn" title="Center on Canvas"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="12" y2="12" /><line x1="12" x2="12" y1="3" y2="21" /></svg></button>
        <button onClick={() => onAlign('right')} className="align-btn" title="Align Right"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="21" y2="12"></line><line x1="19" y1="5" x2="19" y2="19"></line><rect y="5" x="5" width="10" height="14" rx="2"></rect></svg></button>
      </div>

      <Separator orientation="vertical" />

      <div className="opacity-controls-horizontal">
        <label htmlFor="opacity-slider" className="text-xs mr-2">Opacity</label>
        <input
          type="range"
          id="opacity-slider"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={handleOpacitySliderChange}
        />
      </div>

       <Separator orientation="vertical" />

       <div className="flex items-center gap-1">
          <button onClick={() => onFlip('horizontal')} className="align-btn text-xs px-2 h-auto py-1">Flip H</button>
          <button onClick={() => onFlip('vertical')} className="align-btn text-xs px-2 h-auto py-1">Flip V</button>
       </div>
      
       <Separator orientation="vertical" />
       
       <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8">
              <Sparkles className="h-4 w-4 mr-2" /> Animate
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <AnimationPanel selectedNode={selectedNode} onAnimationChange={onAnimationChange} />
          </PopoverContent>
        </Popover>

      {isMask && maskHasImage && (
        <>
          <Separator orientation="vertical" />
          <Popover>
            <PopoverTrigger asChild>
               <Button variant="ghost" size="icon"><Menu size={16}/></Button>
            </PopoverTrigger>
            <PopoverContent>
              <div id="mask-properties" className="py-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mask Properties</h4>
                  <p className="text-xs text-gray-500 mb-2">Adjust the image inside the mask.</p>
                  <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onMaskImageZoom('in')} className="align-btn" title="Zoom In"><ZoomIn size={16}/></button>
                      <button onClick={() => onMaskImageZoom('out')} className="align-btn" title="Zoom Out"><ZoomOut size={16}/></button>
                      <button onClick={onMaskImageReset} className="align-btn" title="Reset Image"><RefreshCw size={16}/></button>
                      <button onClick={() => onMaskImagePan('up')} className="align-btn" title="Move Up"><ArrowUp size={16}/></button>
                      <button onClick={() => onMaskImagePan('down')} className="align-btn" title="Move Down"><ArrowDown size={16}/></button>
                      <button onClick={() => onMaskImagePan('left')} className="align-btn" title="Move Left"><ArrowLeft size={16}/></button>
                      <button onClick={() => onMaskImagePan('right')} className="align-btn" title="Move Right"><ArrowRight size={16}/></button>
                  </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
};

export default ObjectPropertiesPanel;
