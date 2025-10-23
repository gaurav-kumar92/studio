
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

type ClipartDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddClipart: (pathData: string) => void;
};

const cliparts = [
    {
        name: 'Smiley Face',
        pathData: 'M100,20 C44.77,20 0,64.77 0,120 C0,175.23 44.77,220 100,220 C155.23,220 200,175.23 200,120 C200,64.77 155.23,20 100,20 Z M65,80 C73.28,80 80,86.72 80,95 C80,103.28 73.28,110 65,110 C56.72,110 50,103.28 50,95 C50,86.72 56.72,80 65,80 Z M135,80 C143.28,80 150,86.72 150,95 C150,103.28 143.28,110 135,110 C126.72,110 120,103.28 120,95 C120,86.72 126.72,80 135,80 Z M150,140 C150,167.61 127.61,190 100,190 C72.39,190 50,167.61 50,140 L150,140 Z',
        viewBox: '0 0 200 200'
    }
];

const ClipartDialog: React.FC<ClipartDialogProps> = ({ isOpen, onClose, onAddClipart }) => {
    if (!isOpen) {
        return null;
    }

    const handleClipartSelect = (pathData: string) => {
        onAddClipart(pathData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh', maxWidth: '500px' }}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Select Clipart</h3>
                <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-4 flex-grow">
                    {cliparts.map((clipart, index) => (
                        <button
                            key={index}
                            className="shape-btn p-4 flex items-center justify-center"
                            title={clipart.name}
                            onClick={() => handleClipartSelect(clipart.pathData)}
                        >
                           <svg viewBox={clipart.viewBox} width="50" height="50">
                                <path d={clipart.pathData} fill="currentColor" />
                           </svg>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClipartDialog;
