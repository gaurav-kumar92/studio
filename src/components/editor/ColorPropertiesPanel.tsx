
'use client';

import { useState, useEffect, useCallback } from 'react';

type ColorPropertiesPanelProps = {
    selectedNode: any;
    onColorChange: (config: any) => void;
    isStroke?: boolean;
};

const ColorPropertiesPanel: React.FC<ColorPropertiesPanelProps> = ({ selectedNode, onColorChange, isStroke = false }) => {
    const [isGradient, setIsGradient] = useState(false);
    const [color, setColor] = useState('#3b82f6');
    const [color1, setColor1] = useState('#3b82f6');
    const [color2, setColor2] = useState('#a855f7');
    const [gradientDirection, setGradientDirection] = useState('top-to-bottom');

    const handleUpdate = useCallback(() => {
        onColorChange({
            isGradient,
            color: isGradient ? '' : color,
            color1,
            color2,
            gradientDirection,
        });
    }, [isGradient, color, color1, color2, gradientDirection, onColorChange]);

    useEffect(() => {
        if (selectedNode) {
            const nodeIsGradient = selectedNode.getAttr('data-is-gradient') || false;
            setIsGradient(nodeIsGradient);

            if (nodeIsGradient) {
                setColor1(selectedNode.getAttr('data-color1') || '#3b82f6');
                setColor2(selectedNode.getAttr('data-color2') || '#a855f7');
                setGradientDirection(selectedNode.getAttr('data-gradient-direction') || 'top-to-bottom');
            } else {
                const nodeColor = selectedNode.getAttr('data-color1') || selectedNode.fill() || selectedNode.stroke() || '#3b82f6';
                setColor(nodeColor);
                setColor1(nodeColor);
            }
        }
    }, [selectedNode]);

    useEffect(() => {
        // Trigger update whenever a color property changes
        handleUpdate();
    }, [isGradient, color, color1, color2, gradientDirection, handleUpdate]);
    
    const label = isStroke ? 'Stroke' : 'Fill';

    return (
        <div className="border-t border-b border-gray-200 py-4 my-4">
             <div className="mb-4">
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        id="universal-gradient-checkbox" 
                        checked={isGradient} 
                        onChange={(e) => setIsGradient(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="universal-gradient-checkbox" className="ml-2 block text-sm text-gray-900">Gradient {label}</label>
                </div>
            </div>

            {isGradient ? (
                <div id="universal-gradient-controls" className="flex flex-col gap-4">
                    <div className="color-picker-container-inline justify-between">
                        <label className="block text-sm font-medium text-gray-700">Start Color</label>
                        <div className="relative">
                            <div className="color-preview-circle" style={{backgroundColor: color1}}></div>
                            <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="color-picker-input-hidden" />
                        </div>
                    </div>
                     <div className="color-picker-container-inline justify-between">
                        <label className="block text-sm font-medium text-gray-700">End Color</label>
                         <div className="relative">
                            <div className="color-preview-circle" style={{backgroundColor: color2}}></div>
                            <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="color-picker-input-hidden" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                        <select value={gradientDirection} onChange={(e) => setGradientDirection(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="top-to-bottom">Top to Bottom</option>
                            <option value="left-to-right">Left to Right</option>
                            <option value="diagonal-tl-br">Diagonal (TL to BR)</option>
                            <option value="diagonal-tr-bl">Diagonal (TR to BL)</option>
                        </select>
                    </div>
                </div>
            ) : (
                 <div className="color-picker-container-inline justify-between">
                    <label className="block text-sm font-medium text-gray-700">Solid {label}</label>
                     <div className="relative">
                        <div className="color-preview-circle" style={{backgroundColor: color}}></div>
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker-input-hidden" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPropertiesPanel;
