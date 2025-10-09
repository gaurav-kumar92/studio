
'use client';

import React, { useEffect } from 'react';
import ColorPropertiesPanel from './ColorPropertiesPanel';
import { ZoomIn, ZoomOut, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';

type ObjectPropertiesPanelProps = {
  selectedNode: any;
  onAlign: (position: string) => void;
  onOpacityChange: (opacity: number) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onColorChange: (config: any) => void;
  onMaskImageZoom: (direction: 'in' | 'out') => void;
  onMaskImageReset: () => void;
  onMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
};

const ObjectPropertiesPanel: React.FC<ObjectPropertiesPanelProps> = ({
  selectedNode,
  onAlign,
  onOpacityChange,
  onFlip,
  onColorChange,
  onMaskImageZoom,
  onMaskImageReset,
  onMaskImagePan,
}) => {
  const [opacity, setOpacity] = React.useState(1);
  
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
  
  const canHaveColor = selectedNode.hasName('shape') || selectedNode.hasName('textGroup') || selectedNode.hasName('circularText')|| selectedNode.hasName('frame');
  const isLineOrCurve = selectedNode.getAttr('data-type') === 'line' || selectedNode.getAttr('data-type') === 'curve' || selectedNode.getAttr('data-type') === 'arrow'|| selectedNode.hasName('frame');
  const isMask = selectedNode.hasName('mask');
  const maskHasImage = isMask && selectedNode.findOne('.mask-image');

  // Determine the current color for the popover trigger
  const getFillColor = () => {
    if (typeof selectedNode.fill === 'function') {
      return selectedNode.fill();
    }
    // For groups like text, we might need to find the child and get its fill
    const textChild = selectedNode.findOne?.('Text, .mainChar');
    if (textChild && typeof textChild.fill === 'function') {
      return textChild.fill();
    }
    return null;
  };

  const currentColor = selectedNode.getAttr('data-is-gradient') 
    ? 'linear-gradient(to right, #3b82f6, #a855f7)'
    : selectedNode.getAttr('data-solid-color') || (isLineOrCurve ? selectedNode.stroke() : getFillColor()) || '#000000';

  return (
    // Use flex layout to arrange items horizontally
    <div id="object-properties" className="flex items-center gap-2">
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
      
      {isMask && maskHasImage && (
        <>
          <Separator orientation="vertical" />
          <Popover>
            <PopoverTrigger asChild>
               <Button variant="ghost" size="icon"><ZoomIn size={16}/></Button>
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
