
'use client';

import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCanvas } from '@/contexts/CanvasContext';

const ZoomSelector: React.FC = () => {
  const { currentScale, autoZoomEnabled, handleZoomChange } = useCanvas();

  const zoomOptions = [
    { value: 'auto', label: 'Fit to Screen' },
    { value: '0.25', label: '25%' },
    { value: '0.5', label: '50%' },
    { value: '0.75', label: '75%' },
    { value: '1.0', label: '100%' },
    { value: '1.5', label: '150%' },
    { value: '2.0', label: '200%' },
  ];

  const displayValue = autoZoomEnabled ? `${Math.round(currentScale * 100)}% (Fit)` : `${Math.round(currentScale * 100)}%`;
  const selectValue = autoZoomEnabled ? 'auto' : String(currentScale);

  return (
    <div className="flex items-center gap-2">
      <Select value={selectValue} onValueChange={handleZoomChange}>
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Select Zoom" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {zoomOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">{displayValue}</span>
    </div>
  );
};

export default ZoomSelector;
