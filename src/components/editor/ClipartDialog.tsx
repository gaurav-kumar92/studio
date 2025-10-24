
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
        },
        defaultColors: {
            face: '#3b82f6',
            leftEye: 'black',
            rightEye: 'black',
            mouth: 'black'
        }
    },
    {
        name: 'Heart',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 21.23l-1.41-1.41C5.61 15.03 2 11.55 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 4.05-3.61 7.53-8.59 12.32L12 21.23z'
        },
        defaultColors: {
            shape: '#ef4444'
        }
    },
    {
        name: 'Star',
        viewBox: '0 0 24 24',
        parts: {
            shape: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
        },
        defaultColors: {
            shape: '#facc15'
        }
    }
];

const ClipartDialog: React.FC<ClipartDialogProps> = ({ isOpen, onClose, onAddClipart }) => {
    if (!isOpen) {
        return null;
    }

    const handleClipartSelect = (clipart: (typeof cliparts)[0]) => {
        onAddClipart(clipart.parts);
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
                            onClick={() => handleClipartSelect(clipart)}
                        >
                           <svg viewBox={clipart.viewBox} width="50" height="50">
                                {Object.entries(clipart.parts).map(([partName, pathData]) => {
                                    const fill = clipart.defaultColors?.[partName as keyof typeof clipart.defaultColors] || 'black';
                                    return <path key={partName} d={pathData} fill={fill} />;
                                })}
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
