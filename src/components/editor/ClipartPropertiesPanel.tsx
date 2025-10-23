
'use client';

import React, { useState, useEffect } from 'react';

type ClipartPropertiesPanelProps = {
    selectedNode: any;
    onColorChange: (partName: string, color: string) => void;
};

const ClipartPropertiesPanel: React.FC<ClipartPropertiesPanelProps> = ({ selectedNode, onColorChange }) => {
    
    const getInitialColor = (partName: string, defaultColor: string) => {
        if (!selectedNode) return defaultColor;
        const part = selectedNode.findOne(`.clipart-${partName}`);
        return part ? part.fill() : defaultColor;
    };

    const [faceColor, setFaceColor] = useState(() => getInitialColor('face', '#3b82f6'));
    const [eyesColor, setEyesColor] = useState(() => getInitialColor('leftEye', '#000000'));
    const [mouthColor, setMouthColor] = useState(() => getInitialColor('mouth', '#000000'));
    
    useEffect(() => {
        setFaceColor(getInitialColor('face', '#3b82f6'));
        setEyesColor(getInitialColor('leftEye', '#000000'));
        setMouthColor(getInitialColor('mouth', '#000000'));
    }, [selectedNode]);

    const handleColorChange = (partName: string, color: string) => {
        switch (partName) {
            case 'face':
                setFaceColor(color);
                break;
            case 'eyes':
                setEyesColor(color);
                break;
            case 'mouth':
                setMouthColor(color);
                break;
        }
        onColorChange(partName, color);
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            <h4 className="text-sm font-medium text-center mb-2">Clipart Colors</h4>
            
            <div className="color-picker-container-inline justify-between">
                <label className="block text-sm font-medium text-gray-700">Face</label>
                <div className="relative">
                    <div className="color-preview-circle" style={{ backgroundColor: faceColor }}></div>
                    <input 
                        type="color" 
                        value={faceColor} 
                        onChange={(e) => handleColorChange('face', e.target.value)} 
                        className="color-picker-input-hidden" 
                    />
                </div>
            </div>

            <div className="color-picker-container-inline justify-between">
                <label className="block text-sm font-medium text-gray-700">Eyes</label>
                <div className="relative">
                    <div className="color-preview-circle" style={{ backgroundColor: eyesColor }}></div>
                    <input 
                        type="color" 
                        value={eyesColor} 
                        onChange={(e) => handleColorChange('eyes', e.target.value)} 
                        className="color-picker-input-hidden" 
                    />
                </div>
            </div>

            <div className="color-picker-container-inline justify-between">
                <label className="block text-sm font-medium text-gray-700">Mouth</label>
                <div className="relative">
                    <div className="color-preview-circle" style={{ backgroundColor: mouthColor }}></div>
                    <input 
                        type="color" 
                        value={mouthColor} 
                        onChange={(e) => handleColorChange('mouth', e.target.value)} 
                        className="color-picker-input-hidden" 
                    />
                </div>
            </div>
        </div>
    );
};

export default ClipartPropertiesPanel;
