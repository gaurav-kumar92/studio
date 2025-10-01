
'use client';

import { useState, useEffect, useCallback } from 'react';

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
    const [tension, setTension] = useState(0.5);

    // Gradient State
    const [isGradient, setGradient] = useState(false);
    const [color1, setColor1] = useState('#3b82f6');
    const [color2, setColor2] = useState('#a855f7');
    const [gradientDirection, setGradientDirection] = useState('top-to-bottom');

    const handleUpdate = useCallback((attrs: any) => {
        if (editingNode) {
            onUpdateShape(attrs);
        }
    }, [editingNode, onUpdateShape]);

    useEffect(() => {
        if (isOpen && editingNode) {
            const shapeType = editingNode.getAttr('data-type');
            const nodeIsGradient = editingNode.getAttr('data-is-gradient') || false;
            setGradient(nodeIsGradient);

            if (nodeIsGradient) {
                setColor1(editingNode.getAttr('data-color1') || '#3b82f6');
                setColor2(editingNode.getAttr('data-color2') || '#a855f7');
                setGradientDirection(editingNode.getAttr('data-gradient-direction') || 'top-to-bottom');
            } else {
                const shapeColor = editingNode.fill() || editingNode.stroke() || '#3b82f6';
                setColor(shapeColor);
                setColor1(shapeColor);
            }
            
            if (shapeType === 'line' || shapeType === 'arrow' || shapeType === 'curve') {
                setThickness(editingNode.strokeWidth());
            }
            if (shapeType === 'polygon') {
                setSides(editingNode.sides());
            }
            if (shapeType === 'curve') {
                setTension(editingNode.getAttr('data-tension') || 0.5);
            }
        } else if (isOpen) {
            // Reset to defaults when adding a new shape
            resetDialog();
        }
    }, [editingNode, isOpen]);


    const resetDialog = () => {
        setActiveShapeForAddition(null);
        setColor('#3b82f6');
        setThickness(5);
        setSides(6);
        setTension(0.5);
        setGradient(false);
        setColor1('#3b82f6');
        setColor2('#a855f7');
        setGradientDirection('top-to-bottom');
    };

    const handleClose = () => {
        resetDialog();
        onClose();
    };

    const handleAddButtonClick = () => {
        if (activeShapeForAddition) {
            onAddShape({
                type: activeShapeForAddition,
                isGradient,
                color: isGradient ? '' : color,
                color1,
                color2,
                gradientDirection,
                thickness,
                sides,
                tension
            });
            handleClose();
        }
    };

    const handleShapeSelection = (shapeType: string) => {
        const config = {
            type: shapeType,
            isGradient,
            color: isGradient ? '' : color,
            color1,
            color2,
            gradientDirection,
            thickness,
            sides,
            tension
        };
        if (['polygon', 'line', 'arrow', 'curve'].includes(shapeType)) {
            setActiveShapeForAddition(shapeType);
        } else {
            onAddShape(config);
            handleClose();
        }
    };
    
    if (!isOpen) {
        return null;
    }

    const showThicknessControl = activeShapeForAddition === 'line' || activeShapeForAddition === 'arrow' || activeShapeForAddition === 'curve' || (editingNode && (editingNode.getAttr('data-type') === 'line' || editingNode.getAttr('data-type') === 'arrow' || editingNode.getAttr('data-type') === 'curve'));
    const showSidesControl = activeShapeForAddition === 'polygon' || (editingNode && editingNode.getAttr('data-type') === 'polygon');
    const showTensionControl = activeShapeForAddition === 'curve' || (editingNode && editingNode.getAttr('data-type') === 'curve');
    const showMainButtons = !activeShapeForAddition && !editingNode;
    const showAddButton = !!activeShapeForAddition;

    return (
        <div id="shape-dialog" className="dialog-overlay" style={{display: 'flex'}}>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh', maxWidth: '300px' }}>
                <h3 id="shape-dialog-title" className="text-lg font-semibold mb-4 flex-shrink-0">
                    {editingNode ? 'Edit Shape' : 'Add a Shape'}
                </h3>
                <div className="overflow-y-auto pr-4 flex-grow">

                    <div className="mb-4">
                        <div className="flex items-center">
                            <input type="checkbox" id="gradient-checkbox" checked={isGradient} onChange={(e) => { setGradient(e.target.checked); handleUpdate({ isGradient: e.target.checked, color, color1, color2, gradientDirection }); }} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                            <label htmlFor="gradient-checkbox" className="ml-2 block text-sm text-gray-900">Gradient</label>
                        </div>
                    </div>

                    {isGradient ? (
                        <div id="gradient-controls" className="flex flex-col gap-4">
                            <div className="color-picker-container">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Color</label>
                                <div className="color-preview-circle" style={{backgroundColor: color1}}></div>
                                <input type="color" value={color1} onChange={(e) => { setColor1(e.target.value); handleUpdate({ isGradient: true, color1: e.target.value, color2, gradientDirection }); }} className="color-picker-input-hidden" />
                            </div>
                             <div className="color-picker-container">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Color</label>
                                <div className="color-preview-circle" style={{backgroundColor: color2}}></div>
                                <input type="color" value={color2} onChange={(e) => { setColor2(e.target.value); handleUpdate({ isGradient: true, color1, color2: e.target.value, gradientDirection }); }} className="color-picker-input-hidden" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                                <select value={gradientDirection} onChange={(e) => { setGradientDirection(e.target.value); handleUpdate({ isGradient: true, color1, color2, gradientDirection: e.target.value }); }} className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="top-to-bottom">Top to Bottom</option>
                                    <option value="left-to-right">Left to Right</option>
                                    <option value="diagonal-tl-br">Diagonal (TL to BR)</option>
                                    <option value="diagonal-tr-bl">Diagonal (TR to BL)</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                         <div className="color-picker-container">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shape Color</label>
                            <div id="color-preview-shape" className="color-preview-circle" style={{backgroundColor: color}}></div>
                            <input type="color" id="shape-color-picker" value={color} onChange={(e) => { setColor(e.target.value); handleUpdate({ color: e.target.value }); }} className="color-picker-input-hidden" />
                        </div>
                    )}
                   

                    {(showThicknessControl) && (
                        <div id="shape-thickness-controls" className="shape-slider-container">
                            <label htmlFor="shape-thickness-slider" className="block text-sm font-medium text-gray-700">
                                Thickness (<span id="shape-thickness-value">{thickness}</span>px)
                            </label>
                            <input type="range" id="shape-thickness-slider" min="1" max="50" step="1" value={thickness} onChange={(e) => { setThickness(Number(e.target.value)); handleUpdate({ thickness: Number(e.target.value) }); }} className="w-full" />
                        </div>
                    )}

                    {(showSidesControl) && (
                        <div id="shape-sides-controls" className="shape-slider-container">
                            <label htmlFor="shape-sides-slider" className="block text-sm font-medium text-gray-700">
                                Sides (<span id="shape-sides-value">{sides}</span>)
                            </label>
                            <input type="range" id="shape-sides-slider" min="3" max="12" step="1" value={sides} onChange={(e) => { setSides(Number(e.target.value)); handleUpdate({ sides: Number(e.target.value) }); }} className="w-full" />
                        </div>
                    )}
                    
                    {(showTensionControl) && (
                        <div id="shape-tension-controls" className="shape-slider-container">
                            <label htmlFor="shape-tension-slider" className="block text-sm font-medium text-gray-700">
                                Tension (<span id="shape-tension-value">{tension.toFixed(2)}</span>)
                            </label>
                            <input type="range" id="shape-tension-slider" min="0" max="2" step="0.05" value={tension} onChange={(e) => { setTension(Number(e.target.value)); handleUpdate({ tension: Number(e.target.value) }); }} className="w-full" />
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
                            <button className="shape-btn" data-shape="curve" title="Curve" onClick={() => handleShapeSelection('curve')}>
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12c4.4-4.4 8.8-4.4 13.2 0"/><path d="M20 12c-4.4 4.4-8.8 4.4-13.2 0"/></svg>
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
                </div>
                
                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
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

    




