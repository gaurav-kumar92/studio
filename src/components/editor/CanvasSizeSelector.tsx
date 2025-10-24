
'use client';

import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const FacebookIcon = () => (
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
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitterIcon = () => (
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
        <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4 1-2.1.8c-.8.8-2.1.8-3.3 0-1.4 1.4-2.8 2.1-4.2 2.1-2.1 0-4.2-1.4-4.2-4.2s.7-2.8 2.1-4.2c.2-.2.5-.2.7 0 .2.2.2.5 0 .7 0 0-.7.7-.7 2.1 0 1.4.7 2.1 2.1 2.1s2.1-.7 2.1-2.1c0-1.4-2.1-3.5-2.1-3.5s-.7-.7-.7-1.4c0-2.1 1.4-2.8 2.8-2.8s2.1.7 2.1 2.1c0 .7 0 1.4-.7 1.4s-2.1.7-2.1 2.1c0 2.1 1.4 2.8 2.8 2.8s2.8-.7 3.5-2.1c.7-.7 1.4-1.4 1.4-1.4s.7-1.4 2.1-2.1c.7-.7 2.1-1.4 2.1-1.4s-1.4 0-2.8.7c-2.1.7-3.5 2.1-3.5 2.1s-1.4-1.4-2.8-1.4c-1.4 0-2.8.7-2.8 2.1 0 .7.7 1.4.7 1.4s.7.7 1.4.7c.7 0 1.4-.7 1.4-.7s2.1-2.1 2.8-2.8c.7-.7 1.4-1.4 2.1-1.4.7 0 1.4.7 1.4 1.4s-.7 2.1-2.1 2.8c-1.4 1.4-2.8 2.1-4.2 2.1-1.4 0-2.8-.7-3.5-1.4-.7-.7-1.4-1.4-1.4-2.8s.7-2.1 1.4-2.8c.7-.7 1.4-1.4 2.1-1.4s1.4.7 2.1 1.4c.7.7 1.4 1.4 1.4 2.1s-.7 1.4-1.4 1.4-1.4-.7-1.4-1.4c0-.7.7-1.4 1.4-1.4s1.4.7 1.4 1.4z" />
    </svg>
);


const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] h-8">
        <SelectValue placeholder="Select Canvas Size" />
      </SelectTrigger>
      <SelectContent className="max-h-[50vh]">
        <SelectGroup>
            <SelectLabel>Social Media</SelectLabel>
            <SelectItem value="1080x1080">
                <div className="flex items-center">
                    <InstagramIcon />
                    <span>Instagram Post (1080x1080)</span>
                </div>
            </SelectItem>
            <SelectItem value="1080x1920">
                <div className="flex items-center">
                    <InstagramIcon />
                    <span>Instagram Story (1080x1920)</span>
                </div>
            </SelectItem>
            <SelectItem value="1200x630">
                <div className="flex items-center">
                    <FacebookIcon />
                    <span>Facebook Post (1200x630)</span>
                </div>
            </SelectItem>
            <SelectItem value="851x315">
                <div className="flex items-center">
                    <FacebookIcon />
                    <span>Facebook Cover (851x315)</span>
                </div>
            </SelectItem>
             <SelectItem value="1600x900">
                <div className="flex items-center">
                    <TwitterIcon />
                    <span>Twitter Post (1600x900)</span>
                </div>
            </SelectItem>
            <SelectItem value="1200x628">
                <div className="flex items-center">
                    <LinkedInIcon />
                    <span>LinkedIn Post (1200x628)</span>
                </div>
            </SelectItem>
            <SelectItem value="1584x396">
                <div className="flex items-center">
                    <LinkedInIcon />
                    <span>LinkedIn Banner (1584x396)</span>
                </div>
            </SelectItem>
        </SelectGroup>
        <SelectGroup>
            <SelectLabel>Documents</SelectLabel>
            <SelectItem value="816x1056">US Letter - Portrait (8.5x11in)</SelectItem>
            <SelectItem value="1056x816">US Letter - Landscape (11x8.5in)</SelectItem>
            <SelectItem value="842x1191">A4 - Portrait (210x297mm)</SelectItem>
            <SelectItem value="1191x842">A4 - Landscape (297x210mm)</SelectItem>
            <SelectItem value="595x842">A5 - Portrait (148x210mm)</SelectItem>
            <SelectItem value="842x595">A5 - Landscape (210x148mm)</SelectItem>
        </SelectGroup>
        <SelectGroup>
            <SelectLabel>Digital</SelectLabel>
            <SelectItem value="1920x1080">HD Screen (16:9)</SelectItem>
            <SelectItem value="414x896">Phone Screen</SelectItem>
            <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
             <SelectItem value="1024x1024-circle">Circle (1024x1024)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CanvasSizeSelector;

    