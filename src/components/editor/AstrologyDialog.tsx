
'use client';

import React from 'react';
import { astrologySymbols } from '@/lib/astrology-symbols';
import { Button } from '@/components/ui/button';

type AstrologyDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectAstrology: (astrology: { parts: { [key: string]: string }, defaultColors: { [key: string]: string } }) => void;
};

const AstrologyDialog: React.FC<AstrologyDialogProps> = ({ isOpen, onClose, onSelectAstrology }) => {
    if (!isOpen) {
        return null;
    }

    const handleAstrologySelect = (symbol: (typeof astrologySymbols)[0]) => {
        onSelectAstrology({ parts: symbol.parts, defaultColors: symbol.defaultColors });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh', maxWidth: '500px' }}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Select an Astrology Symbol</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 overflow-y-auto pr-4 flex-grow">
                    {astrologySymbols.map((symbol, index) => (
                        <button
                            key={index}
                            className="shape-btn p-4 flex items-center justify-center"
                            title={symbol.name}
                            onClick={() => handleAstrologySelect(symbol)}
                        >
                           <svg viewBox="0 0 24 24" width="50" height="50">
                                {Object.entries(symbol.parts).map(([partName, pathData]) => {
                                    const fill = symbol.defaultColors?.[partName as keyof typeof symbol.defaultColors] || 'black';
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

export default AstrologyDialog;
