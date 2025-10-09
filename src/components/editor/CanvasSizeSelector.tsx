
'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CanvasSizeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] h-8">
        <SelectValue placeholder="Select Canvas Size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="500x500">Square (500x500)</SelectItem>
        <SelectItem value="500x500-circle">Circle (500x500)</SelectItem>
        <SelectItem value="375x667">Phone (375x667)</SelectItem>
        <SelectItem value="1920x1080">HD Screen (1920x1080)</SelectItem>
        <SelectItem value="1366x768">Laptop (1366x768)</SelectItem>
        <SelectItem value="842x1191">A4 (842x1191)</SelectItem>
        <SelectItem value="1191x1684">A3 (1191x1684)</SelectItem>
        <SelectItem value="595x842">A5 (595x842)</SelectItem>
        <SelectItem value="1684x2384">A2 (1684x2384)</SelectItem>
        <SelectItem value="2384x3370">A1 (2384x3370)</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CanvasSizeSelector;
