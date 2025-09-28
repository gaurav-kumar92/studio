
'use client';

import React from 'react';

type AddItemDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSelectItem: (itemType: string) => void;
};

const AddItemDialog: React.FC<AddItemDialogProps> = ({ isOpen, onClose, onSelectItem }) => {
    if (!isOpen) {
        return null;
    }

    const handleItemClick = (itemType: string) => {
        onSelectItem(itemType);
    };

    return (
        <div id="add-item-dialog" className="dialog-overlay" style={{ display: 'flex' }}>
            <div className="dialog">
                <h3 className="text-lg font-semibold mb-6">What would you like to add?</h3>
                <div id="add-item-options" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <button className="add-item-card" data-item-type="text" onClick={() => handleItemClick('text')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                        <span>Text</span>
                    </button>
                    <button className="add-item-card" data-item-type="shape" onClick={() => handleItemClick('shape')}>
                        <svg className="w-10 h-10 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        <span>Shape</span>
                    </button>
                     <button className="add-item-card" data-item-type="image" onClick={() => handleItemClick('image')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        <span>Image</span>
                    </button>
                    <button className="add-item-card" data-item-type="frame" onClick={() => handleItemClick('frame')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                        <span>Frame</span>
                    </button>
                    <button className="add-item-card" data-item-type="mask" onClick={() => handleItemClick('mask')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 0 0 7.5 7.5v-15A7.5 7.5 0 0 0 4.5 12z"/></svg>
                        <span>Mask</span>
                    </button>
                     <button className="add-item-card" data-item-type="qr" disabled>
                        <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/><path d="M12 21h-1a2 2 0 0 1-2-2v-1"/></svg>
                        <span>QR Code</span>
                    </button>
                </div>
                <div className="dialog-actions mt-6">
                    <button id="cancel-add-item-btn" className="dialog-button dialog-button-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddItemDialog;
