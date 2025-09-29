
'use client';

import { useState, useEffect } from 'react';

type ShapeDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddShape: (config: any) => void;
    onUpdateShape: (attrs: any) => void;
    editingNode: any;
};

const ShapeDialog: React.FC<ShapeDialogProps> = ({ isOpen, onClose, onAddShape, onUpdateShape, editingNode }) => {
    const [activeShapeForAddition, setActiveShapeForAddition] = useState<string | null>(null);
    const [color, setColor] = useState('#3b82f6');
    const [thickness, setThickness] = useState(5);
    const [sides, setSides] = useState(6);

    useEffect(() => {
        if (editingNode) {
            const shapeColor = editingNode.fill() || editingNode.stroke();
            setColor(shapeColor);

            const shapeType = editingNode.getAttr('data-type');
            if (shapeType === 'line' || shapeType === 'arrow') {
                setThickness(editingNode.strokeWidth());
            }
            if (shapeType === 'polygon') {
                setSides(editingNode.sides());
            }
        } else {
            // Reset to defaults when adding a new shape
            resetDialog();
        }
    }, [editingNode, isOpen]);

    useEffect(() => {
        if (editingNode) {
            onUpdateShape({ color });
        }
    }, [color]);

    useEffect(() => {
        if (editingNode) {
            onUpdateShape({ thickness });
        }
    }, [thickness]);

    useEffect(() => {
        if (editingNode) {
            onUpdateShape({ sides });
        }
    }, [sides]);

    const resetDialog = () => {
        setActiveShapeForAddition(null);
        setColor('#3b82f6');
        setThickness(5);
        setSides(6);
    };

    const handleClose = () => {
        resetDialog();
        onClose();
    };

    const handleAddButtonClick = () => {
        if (activeShapeForAddition) {
            onAddShape({
                type: activeShapeForAddition,
                color,
                thickness,
                sides,
            });
            handleClose();
        }
    };

    const handleShapeSelection = (shapeType: string) => {
        if (shapeType === 'polygon' || shapeType === 'line' || shapeType === 'arrow') {
            setActiveShapeForAddition(shapeType);
        } else {
            onAddShape({ type: shapeType, color });
            handleClose();
        }
    };
    
    if (!isOpen) {
        return null;
    }

    const showThicknessControl = activeShapeForAddition === 'line' || activeShapeForAddition === 'arrow' || (editingNode && (editingNode.getAttr('data-type') === 'line' || editingNode.getAttr('data-type') === 'arrow'));
    const showSidesControl = activeShapeForAddition === 'polygon' || (editingNode && editingNode.getAttr('data-type') === 'polygon');
    const showMainButtons = !activeShapeForAddition && !editingNode;
    const showAddButton = !!activeShapeForAddition;

    return (
        <div id="shape-dialog" className="dialog-overlay" style={{display: 'flex'}}>
            <div className="dialog">
                <h3 id="shape-dialog-title" className="text-lg font-semibold mb-4">
                    {editingNode ? 'Edit Shape' : 'Add a Shape'}
                </h3>
                 <div className="color-picker-container">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shape Color</label>
                    <div id="color-preview-shape" className="color-preview-circle" style={{backgroundColor: color}}></div>
                    <input type="color" id="shape-color-picker" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker-input-hidden" />
                </div>

                {(showThicknessControl) && (
                    <div id="shape-thickness-controls" className="shape-slider-container">
                        <label htmlFor="shape-thickness-slider" className="block text-sm font-medium text-gray-700">
                            Thickness (<span id="shape-thickness-value">{thickness}</span>px)
                        </label>
                        <input type="range" id="shape-thickness-slider" min="1" max="50" step="1" value={thickness} onChange={(e) => setThickness(Number(e.target.value))} className="w-full" />
                    </div>
                )}

                 {(showSidesControl) && (
                     <div id="shape-sides-controls" className="shape-slider-container">
                        <label htmlFor="shape-sides-slider" className="block text-sm font-medium text-gray-700">
                            Sides (<span id="shape-sides-value">{sides}</span>)
                        </label>
                        <input type="range" id="shape-sides-slider" min="3" max="12" step="1" value={sides} onChange={(e) => setSides(Number(e.target.value))} className="w-full" />
                    </div>
                 )}

                {showMainButtons && (
                    <div id="shape-buttons-container" className="shape-button-container mt-4">
                        <button className="shape-btn" data-shape="rect" title="Rectangle" onClick={() => handleShapeSelection('rect')}>
                            <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                        </button>
                        <button className="shape-btn" data-shape="circle" title="Circle" onClick={() => handleShapeSelection('circle')}>
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
                        </button>
                        <button className="shape-btn" data-shape="triangle" title="Triangle" onClick={() => handleShapeSelection('triangle')}>
                            <svg viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2z"/></svg>
                        </button>
                        <button className="shape-btn" data-shape="line" title="Line" onClick={() => handleShapeSelection('line')}>
                           <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M3 12h18"/></svg>
                        </button>
                        <button className="shape-btn" data-shape="star" title="Star" onClick={() => handleShapeSelection('star')}>
                            <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        </button>
                        <button className="shape-btn" data-shape="pentagon" title="Pentagon" onClick={() => handleShapeSelection('pentagon')}>
                            <svg viewBox="0 0 24 24"><path d="M12 2.5l9.51 6.91-3.63 11.09H6.12l-3.63-11.09L12 2.5z"/></svg>
                        </button>
                        <button className="shape-btn" data-shape="polygon" title="Polygon" onClick={() => handleShapeSelection('polygon')}>
                            <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"><path d="M12 2.5l7.79 4.5 0 9 -7.79 4.5 -7.79 -4.5 0 -9Z"/></svg>
                        </button>
                        <button className="shape-btn" data-shape="arrow" title="Arrow" onClick={() => handleShapeSelection('arrow')}>
                            <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                        </button>
                    </div>
                )}
                
                <div className="dialog-actions flex justify-end gap-2 mt-4">
                    <button id="cancel-shape-btn" className="dialog-button dialog-button-secondary" onClick={handleClose}>
                        {editingNode ? 'Done' : 'Cancel'}
                    </button>
                    {showAddButton && (
                        <button id="add-shape-btn" className="dialog-button dialog-button-primary" onClick={handleAddButtonClick}>
                            Add Shape
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShapeDialog;
