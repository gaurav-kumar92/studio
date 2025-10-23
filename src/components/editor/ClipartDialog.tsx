
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

type ClipartDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddClipart: (parts: { [key: string]: string }) => void;
};

const cliparts = [
    {
        name: 'Smiley Face',
        viewBox: '0 0 200 200',
        parts: {
            face: 'M100 20C44.77 20 0 64.77 0 120s44.77 100 100 100 100-44.77 100-100S155.23 20 100 20z',
            leftEye: 'M65 80c8.28 0 15 6.72 15 15s-6.72 15-15 15-15-6.72-15-15 6.72-15 15-15z',
            rightEye: 'M135 80c8.28 0 15 6.72 15 15s-6.72 15-15 15-15-6.72-15-15 6.72-15 15-15z',
            mouth: 'M50 140c0 27.61 22.39 50 50 50s50-22.39 50-50H50z'
        }
    }
];

const ClipartDialog: React.FC<ClipartDialogProps> = ({ isOpen, onClose, onAddClipart }) => {
    if (!isOpen) {
        return null;
    }

    const handleClipartSelect = (parts: { [key: string]: string }) => {
        onAddClipart(parts);
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
                            onClick={() => handleClipartSelect(clipart.parts)}
                        >
                           <svg viewBox={clipart.viewBox} width="50" height="50">
                                <path d={clipart.parts.face} fill="#3b82f6" />
                                <path d={clipart.parts.leftEye} fill="black" />
                                <path d={clipart.parts.rightEye} fill="black" />
                                <path d={clipart.parts.mouth} fill="black" />
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
