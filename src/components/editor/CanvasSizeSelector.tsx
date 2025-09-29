
'use client';

import React from 'react';

type CanvasSizeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
        <label htmlFor="canvas-size" className="block text-sm font-medium text-gray-700 mb-2">Select Canvas Size</label>
        <select id="canvas-size" value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="500x500">Square (500x500)</option>
            <option value="500x500-circle">Circle (500x500)</option>
            <option value="375x667">Phone (375x667)</option>
            <option value="1920x1080">HD Screen (1920x1080)</option>
            <option value="1366x768">Laptop (1366x768)</option>
            <option value="842x1191">A4 (842x1191)</option>
            <option value="1191x1684">A3 (1191x1684)</option>
            <option value="595x842">A5 (595x842)</option>
            <option value="1684x2384">A2 (1684x2384)</option>
            <option value="2384x3370">A1 (2384x3370)</option>
        </select>
    </div>
  );
};

export default CanvasSizeSelector;
