

'use client';

import React, { useEffect } from 'react';
import ColorPropertiesPanel from './ColorPropertiesPanel';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

type ObjectPropertiesPanelProps = {
  selectedNode: any;
  onAlign: (position: string) => void;
  onOpacityChange: (opacity: number) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onColorChange: (config: any) => void;
  onMaskImageZoom: (direction: 'in' | 'out') => void;
  onMaskImageReset: () => void;
};

const ObjectPropertiesPanel: React.FC<ObjectPropertiesPanelProps> = ({
  selectedNode,
  onAlign,
  onOpacityChange,
  onFlip,
  onColorChange,
  onMaskImageZoom,
  onMaskImageReset,
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
  
  const canHaveColor = selectedNode.hasName('shape') || selectedNode.hasName('textGroup') || selectedNode.hasName('circularText');
  const isLineOrCurve = selectedNode.getAttr('data-type') === 'line' || selectedNode.getAttr('data-type') === 'curve' || selectedNode.getAttr('data-type') === 'arrow';
  const isMask = selectedNode.hasName('mask');
  const maskHasImage = isMask && selectedNode.findOne('.mask-image');

  return (
    <div id="object-properties">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Object Properties
      </h4>

      {canHaveColor && (
        <ColorPropertiesPanel 
            selectedNode={selectedNode}
            onColorChange={onColorChange}
            isStroke={isLineOrCurve}
        />
      )}
      
      {isMask && maskHasImage && (
        <div id="mask-properties" className="border-t border-b border-gray-200 py-4 my-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Mask Properties
            </h4>
            <p className="text-xs text-gray-500 mb-2">Adjust the image inside the mask. You can also drag the image to reposition it.</p>
            <div className="flex gap-2">
                <button onClick={() => onMaskImageZoom('in')} className="button button-secondary flex-grow text-xs px-2 py-1 flex items-center justify-center gap-1">
                    <ZoomIn size={16}/> Zoom In
                </button>
                <button onClick={() => onMaskImageZoom('out')} className="button button-secondary flex-grow text-xs px-2 py-1 flex items-center justify-center gap-1">
                    <ZoomOut size={16}/> Zoom Out
                </button>
                <button onClick={onMaskImageReset} className="button button-secondary flex-grow text-xs px-2 py-1 flex items-center justify-center gap-1">
                    <RefreshCw size={16}/> Reset
                </button>
            </div>
        </div>
      )}

      <div className="alignment-controls">
        <button
          onClick={() => onAlign('top')}
          className="align-btn"
          title="Align Top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="3"></line>
            <line x1="5" y1="5" x2="19" y2="5"></line>
            <rect x="5" y="9" width="14" height="10" rx="2"></rect>
          </svg>
        </button>
        <button
          onClick={() => onAlign('left')}
          className="align-btn"
          title="Align Left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="3" y2="12"></line>
            <line x1="5" y1="5" x2="5" y2="19"></line>
            <rect y="5" x="9" width="10" height="14" rx="2"></rect>
          </svg>
        </button>
        <button
          onClick={() => onAlign('center')}
          className="align-btn"
          title="Center on Canvas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="12" x2="12" y1="3" y2="21" />
          </svg>
        </button>
        <button
          onClick={() => onAlign('right')}
          className="align-btn"
          title="Align Right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="21" y2="12"></line>
            <line x1="19" y1="5" x2="19" y2="19"></line>
            <rect y="5" x="5" width="10" height="14" rx="2"></rect>
          </svg>
        </button>
        <button
          onClick={() => onAlign('bottom')}
          className="align-btn"
          title="Align Bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="21"></line>
            <line x1="5" y1="19" x2="19" y2="19"></line>
            <rect x="5" y="5" width="14" height="10" rx="2"></rect>
          </svg>
        </button>
      </div>
      <div className="opacity-controls mt-2">
        <label htmlFor="opacity-slider">Opacity</label>
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
      <div id="transform-controls" className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Transform Tools</h4>
        <div className="flex gap-2">
          <button onClick={() => onFlip('horizontal')} className="button button-secondary flex-grow text-xs px-2 py-1">Flip Horizontal</button>
          <button onClick={() => onFlip('vertical')} className="button button-secondary flex-grow text-xs px-2 py-1">Flip Vertical</button>
        </div>
      </div>
    </div>
  );
};

export default ObjectPropertiesPanel;
