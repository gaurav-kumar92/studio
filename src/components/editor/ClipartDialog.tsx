
'use client';

import React from 'react';

type ClipartDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectClipart: (svgString: string) => void;
};

const ClipartDialog: React.FC<ClipartDialogProps> = ({ isOpen, onClose, onSelectClipart }) => {
    if (!isOpen) {
        return null;
    }

    const smileyFaceSvg = `<svg viewBox="0 0 200 200" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <!-- Face -->
  <circle cx="100" cy="100" r="80" stroke="black" stroke-width="3" fill="yellow" />
  <!-- Left Eye -->
  <circle cx="65" cy="80" r="10" fill="black" />
  <!-- Right Eye -->
  <circle cx="135" cy="80" r="10" fill="black" />
  <!-- Mouth -->
  <path d="M 65 120 Q 100 150, 135 120" fill="none" stroke="black" stroke-width="3" />
</svg>`;

    const handleSelect = () => {
        onSelectClipart(smileyFaceSvg);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-6 flex-shrink-0">Select Clipart</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-4 flex-grow">
                    <button className="shape-btn" onClick={handleSelect} title="Smiley Face">
                        <div dangerouslySetInnerHTML={{ __html: smileyFaceSvg }} />
                    </button>
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ClipartDialog;
