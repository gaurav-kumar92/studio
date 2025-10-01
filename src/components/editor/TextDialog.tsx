

'use client';

import { useState, useEffect } from 'react';

type TextDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddOrUpdateText: (config: any) => void;
    editingNode: any;
};

const TextDialog: React.FC<TextDialogProps> = ({ isOpen, onClose, onAddOrUpdateText, editingNode }) => {
    const [text, setText] = useState('');
    const [fontSize, setFontSize] = useState(24);
    const [fontFamily, setFontFamily] = useState('Inter');
    const [isBold, setBold] = useState(false);
    const [isItalic, setItalic] = useState(false);
    const [isUnderline, setUnderline] = useState(false);
    const [isStrikethrough, setStrikethrough] = useState(false);
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [lineHeight, setLineHeight] = useState(1);
    const [align, setAlign] = useState('left');
    const [isShadow, setShadow] = useState(false);
    const [shadowBlur, setShadowBlur] = useState(10);
    const [shadowDistance, setShadowDistance] = useState(5);
    const [shadowOpacity, setShadowOpacity] = useState(0.5);
    const [isGlow, setGlow] = useState(false);
    const [glowColor, setGlowColor] = useState('#0000ff');
    const [glowBlur, setGlowBlur] = useState(10);
    const [glowOpacity, setGlowOpacity] = useState(0.7);
    const [radius, setRadius] = useState(150);
    const [curvature, setCurvature] = useState(0);

    useEffect(() => {
        if (editingNode) {
             const data = editingNode.attrs;
            setText(data['data-text'] || '');
            setFontSize(data['data-font-size'] || 24);
            setFontFamily(data['data-font-family'] || 'Inter');
            setLetterSpacing(data['data-letter-spacing'] || 0);
            setLineHeight(data['data-line-height'] || 1);
            setAlign(data['data-align'] || 'left');
            setBold(data['data-is-bold'] || false);
            setItalic(data['data-is-italic'] || false);
            setUnderline(data['data-is-underline'] || false);
            setStrikethrough(data['data-is-strikethrough'] || false);
            setShadow(data['data-is-shadow'] || false);
            setShadowBlur(data['data-shadow-blur'] || 10);
            setShadowDistance(data['data-shadow-distance'] || 5);
            setShadowOpacity(data['data-shadow-opacity'] || 0.5);
            setGlow(data['data-is-glow'] || false);
            setGlowColor(data['data-glow-color'] || '#0000ff');
            setGlowBlur(data['data-glow-blur'] || 10);
            setGlowOpacity(data['data-glow-opacity'] || 0.7);
            setRadius(data['data-radius'] || 150);
            setCurvature(data['data-curvature'] || 0);
        } else {
            resetDialog();
        }
    }, [editingNode, isOpen]);

    const resetDialog = () => {
        setText('');
        setFontSize(24);
        setFontFamily('Inter');
        setBold(false);
        setItalic(false);
        setUnderline(false);
        setStrikethrough(false);
        setLetterSpacing(0);
        setLineHeight(1);
        setAlign('left');
        setShadow(false);
        setShadowBlur(10);
        setShadowDistance(5);
        setShadowOpacity(0.5);
        setGlow(false);
        setGlowColor('#0000ff');
        setGlowBlur(10);
        setGlowOpacity(0.7);
        setRadius(150);
        setCurvature(0);
    };

    const handleAddOrUpdate = () => {
        onAddOrUpdateText({
            text: text || 'New Text',
            fontSize,
            fontFamily,
            letterSpacing,
            lineHeight,
            align,
            isBold,
            isItalic,
            isUnderline,
            isStrikethrough,
            isShadow,
            shadowBlur,
            shadowDistance,
            shadowOpacity,
            isGlow,
            glowColor,
            glowBlur,
            glowOpacity,
            radius,
            curvature
        });
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const dialogTitle = editingNode ? 'Update Text' : 'Add Text';

    return (
        <div id="text-dialog-container" className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={onClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh' }}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">{dialogTitle}</h3>
                
                <div className="overflow-y-auto pr-4 flex-grow">
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="dialog-input p-2 border rounded-md w-full mb-4" 
                        placeholder="Enter your text..." 
                    />
                     <div className="mt-4 pt-4 relative">
                        { editingNode && (
                            <p className="text-center text-gray-500 mb-4">Color properties can be changed in the main panel.</p>
                         )}

                        <div className="mb-4 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Font Size</label>
                            <input 
                                type="number" 
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full p-2 border rounded-md" 
                                min="1"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Font Family</label>
                            <select 
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="Inter">Inter</option>
                                <option value="Arial">Arial</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Impact">Impact</option>
                                <option value="Comic Sans MS">Comic Sans MS</option>
                                <option value="Trebuchet MS">Trebuchet MS</option>
                                <option value="Arial Black">Arial Black</option>
                                <option value="Garamond">Garamond</option>
                            </select>
                        </div>
                         <div className="mb-4 flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Radius</label>
                            <input 
                                type="range" 
                                min="10" 
                                max="250" 
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="flex-grow ml-4" 
                            />
                        </div>
                        <div className="mb-4 flex flex-col items-start w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Curvature</label>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={curvature}
                                onChange={(e) => setCurvature(Number(e.target.value))}
                                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer" 
                            />
                            <div className="flex justify-between w-full text-xs text-gray-500 mt-1">
                                <span className="text-gray-600 font-semibold">Straight (0)</span>
                                <span className="text-gray-600 font-semibold">Full Wrap (100)</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Font Style</label>
                            <div className="flex gap-2 justify-center">
                                <button onClick={() => setBold(!isBold)} className={`p-2 border rounded-md font-bold ${isBold ? 'active' : ''}`}>B</button>
                                <button onClick={() => setItalic(!isItalic)} className={`p-2 border rounded-md italic ${isItalic ? 'active' : ''}`}>I</button>
                                <button onClick={() => setUnderline(!isUnderline)} className={`p-2 border rounded-md underline ${isUnderline ? 'active' : ''}`}>U</button>
                                <button onClick={() => setStrikethrough(!isStrikethrough)} className={`p-2 border rounded-md line-through ${isStrikethrough ? 'active' : ''}`}>S</button>
                                <button onClick={() => setShadow(!isShadow)} className={`p-2 border rounded-md shadow-sm ${isShadow ? 'active' : ''}`}>Shadow</button>
                                <button onClick={() => setGlow(!isGlow)} className={`p-2 border rounded-md shadow-sm ${isGlow ? 'active' : ''}`}>Glow</button>
                            </div>
                        </div>
                        <div id="advanced-text-controls" className={`flex flex-col gap-4 mt-4 ${curvature > 0 ? 'hidden' : ''}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Letter Spacing</label>
                                <input type="range" value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value))} min="-10" max="20" step="1" className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Line Height</label>
                                <input type="range" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} min="0.5" max="3" step="0.1" className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alignment</label>
                                <div className="flex gap-2 justify-center mt-1">
                                    <button onClick={() => setAlign('left')} className={`p-2 border rounded-md ${align === 'left' ? 'active' : ''}`} title="Align Left">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                                    </button>
                                    <button onClick={() => setAlign('center')} className={`p-2 border rounded-md ${align === 'center' ? 'active' : ''}`} title="Align Center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="17" y1="6" x2="7" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="7" y2="18"></line></svg>
                                    </button>
                                    <button onClick={() => setAlign('right')} className={`p-2 border rounded-md ${align === 'right' ? 'active' : ''}`} title="Align Right">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="7" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={`flex flex-col gap-2 mt-4 ${!isShadow ? 'hidden' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700">Shadow Blur (Current: <span>{shadowBlur}</span>)</label>
                            <input type="range" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} min="0" max="20" />
                            <label className="block text-sm font-medium text-gray-700">Shadow Distance (Current: <span>{shadowDistance}</span>)</label>
                            <input type="range" value={shadowDistance} onChange={(e) => setShadowDistance(Number(e.target.value))} min="0" max="20" />
                            <label className="block text-sm font-medium text-gray-700">Shadow Opacity (Current: <span>{shadowOpacity.toFixed(2)}</span>)</label>
                            <input type="range" value={shadowOpacity} onChange={(e) => setShadowOpacity(Number(e.target.value))} min="0" max="1" step="0.1" />
                        </div>
                         <div className={`flex flex-col gap-4 mt-4 ${!isGlow ? 'hidden' : ''}`}>
                            <div className="color-picker-container-inline">
                                <label className="block text-sm font-medium text-gray-700 mr-4">Glow Color</label>
                                <div className="color-preview-circle" style={{backgroundColor: glowColor}}></div>
                                <input type="color" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} className="color-picker-input-hidden" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Glow Blur (Current: <span>{glowBlur}</span>)</label>
                              <input type="range" value={glowBlur} onChange={(e) => setGlowBlur(Number(e.target.value))} min="0" max="20" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Glow Opacity (Current: <span>{glowOpacity.toFixed(2)}</span>)</label>
                              <input type="range" value={glowOpacity} onChange={(e) => setGlowOpacity(Number(e.target.value))} min="0" max="1" step="0.1" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
                    <button onClick={onClose} className="dialog-button dialog-button-secondary">Cancel</button>
                    <button onClick={handleAddOrUpdate} className="dialog-button dialog-button-primary">{dialogTitle}</button>
                </div>
            </div>
        </div>
    );
}

export default TextDialog;
