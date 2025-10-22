
'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CanvasSizeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const InstagramIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="mr-2"
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const LinkedInIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);


const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[220px] h-8">
        <SelectValue placeholder="Select Canvas Size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1080x1080">
            <div className="flex items-center">
                <InstagramIcon />
                <span className="text-xs">Instagram Post (1080x1080)</span>
            </div>
        </SelectItem>
        <SelectItem value="1080x1920">
            <div className="flex items-center">
                <InstagramIcon />
                <span className="text-xs">Instagram Story (1080x1920)</span>
            </div>
        </SelectItem>
        <SelectItem value="1584x396">
            <div className="flex items-center">-
                <LinkedInIcon />
                <span className="text-xs">LinkedIn Banner (1584x396)</span>
            </div>
        </SelectItem>
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
