
'use client';

import React from 'react';
import { dicesAndTilesSymbols } from '@/lib/dices-and-tiles-symbols';

type DicesAndTilesDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectDicesAndTiles: (symbol: string) => void;
};

const DicesAndTilesDialog: React.FC<DicesAndTilesDialogProps> = ({ isOpen, onClose, onSelectDicesAndTiles }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-6 flex-shrink-0">Select a Dice or Tile Symbol</h3>
                <div id="dices-and-tiles-symbol-options" className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto pr-4 flex-grow">
                    {dicesAndTilesSymbols.map(symbol => (
                        <button key={symbol} className="add-item-card" onClick={() => onSelectDicesAndTiles(symbol)}>
                            <span className="text-3xl">{symbol}</span>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button id="cancel-dices-dialog-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DicesAndTilesDialog;
