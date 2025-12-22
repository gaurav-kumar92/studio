
'use client';

import React from 'react';
import { weatherSymbols } from '@/lib/weather-symbols';

type WeatherDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectWeather: (weather: string) => void;
};

const WeatherDialog: React.FC<WeatherDialogProps> = ({ isOpen, onClose, onSelectWeather }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-6 flex-shrink-0">Select a Weather Symbol</h3>
                <div id="weather-symbol-options" className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto pr-4 flex-grow">
                    {weatherSymbols.map(weather => (
                        <button key={weather} className="add-item-card" onClick={() => onSelectWeather(weather)}>
                            <span className="text-3xl">{weather}</span>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button id="cancel-weather-dialog-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default WeatherDialog;
