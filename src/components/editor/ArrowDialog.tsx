
'use client';

import React from 'react';
import { arrowSymbols } from '@/lib/arrow-symbols';

type ArrowDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectArrow: (arrow: string) => void;
};

const ArrowDialog: React.FC<ArrowDialogProps> = ({ isOpen, onClose, onSelectArrow }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-6 flex-shrink-0">Select an Arrow Symbol</h3>
                <div id="arrow-symbol-options" className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto pr-4 flex-grow">
                    {arrowSymbols.map(arrow => (
                        <button key={arrow} className="add-item-card" onClick={() => onSelectArrow(arrow)}>
                            <span className="text-3xl">{arrow}</span>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button id="cancel-arrow-dialog-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ArrowDialog;
