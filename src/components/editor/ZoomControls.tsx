
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Minimize } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';

const ZoomControls: React.FC = () => {
  const { canvasScale, zoomIn, zoomOut, fitToScreen } = useCanvas();

  const displayScale = `${Math.round(canvasScale * 100)}%`;

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        className="w-20 h-8 text-sm font-semibold"
        onClick={fitToScreen}
        title="Fit to screen"
      >
        {displayScale}
      </Button>
      <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </Button>
       <Button variant="ghost" size="icon" onClick={fitToScreen} title="Fit to Screen">
        <Minimize className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControls;
