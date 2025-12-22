
'use client';

import React from 'react';
import { astrologySymbols } from '@/lib/astrology-symbols';

type AstrologyDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectAstrology: (astrology: string) => void;
};

const AstrologyDialog: React.FC<AstrologyDialogProps> = ({ isOpen, onClose, onSelectAstrology }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-6 flex-shrink-0">Select an Astrology Symbol</h3>
                <div id="astrology-symbol-options" className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto pr-4 flex-grow">
                    {astrologySymbols.map(astrology => (
                        <button key={astrology} className="add-item-card" onClick={() => onSelectAstrology(astrology)}>
                            <span className="text-3xl">{astrology}</span>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button id="cancel-astrology-dialog-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AstrologyDialog;
