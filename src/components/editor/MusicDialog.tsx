
'use client';

import React from 'react';
import { musicSymbols } from '@/lib/music-symbols';

type MusicDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectMusic: (music: string) => void;
};

const MusicDialog: React.FC<MusicDialogProps> = ({ isOpen, onClose, onSelectMusic }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-6 flex-shrink-0">Select a Music Symbol</h3>
                <div id="music-symbol-options" className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-y-auto pr-4 flex-grow">
                    {musicSymbols.map(music => (
                        <button key={music} className="add-item-card" onClick={() => onSelectMusic(music)}>
                            <span className="text-3xl">{music}</span>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions mt-6 flex-shrink-0">
                    <button id="cancel-music-dialog-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default MusicDialog;
