
'use client';

import React from 'react';

type ClipartDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddClipart: (svgString: string) => void;
};

const cliparts = [
    {
        name: 'Smiley Face',
        svg: '<svg viewBox="0 0 200 200" width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" stroke="black" stroke-width="3" fill="yellow" /><circle cx="65" cy="80" r="10" fill="black" /><circle cx="135" cy="80" r="10" fill="black" /><path d="M 65 120 Q 100 150, 135 120" fill="none" stroke="black" stroke-width="3" /></svg>'
    }
];

const ClipartDialog: React.FC<ClipartDialogProps> = ({ isOpen, onClose, onAddClipart }) => {
    if (!isOpen) {
        return null;
    }

    const handleClipartSelect = (svgString: string) => {
        onAddClipart(svgString);
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
                            className="shape-btn p-4"
                            title={clipart.name}
                            onClick={() => handleClipartSelect(clipart.svg)}
                            dangerouslySetInnerHTML={{ __html: clipart.svg }}
                        />
                    ))}
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
                    <button className="dialog-button dialog-button-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClipartDialog;
