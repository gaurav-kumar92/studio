'use client';

import React from 'react';
import { currencySymbols } from '@/lib/currency-symbols';

type CurrencyDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectCurrency: (currency: string) => void;
};

const CurrencyDialog: React.FC<CurrencyDialogProps> = ({ isOpen, onClose, onSelectCurrency }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-6 flex-shrink-0">Select a Currency Symbol</h3>
                <div id="currency-symbol-options" className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto pr-4 flex-grow">
                    {currencySymbols.map(currency => (
                        <button key={currency} className="add-item-card" onClick={() => onSelectCurrency(currency)}>
                            <span className="text-3xl">{currency}</span>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button id="cancel-currency-dialog-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CurrencyDialog;
