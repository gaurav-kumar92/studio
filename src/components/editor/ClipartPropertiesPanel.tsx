
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';

const ClipartPropertiesPanel: React.FC = () => {
    const { selectedNodes, handleClipartPartColorChange } = useCanvas();
    const selectedNode = selectedNodes.length === 1 && selectedNodes[0].hasName('clipart') ? selectedNodes[0] : null;

    const parts = useMemo(() => {
        if (!selectedNode) return [];

        const partNodes = selectedNode.find((node: any) => node.name().startsWith('clipart-'));
        const partData = new Map<string, { color: string; nodes: any[] }>();

        partNodes.forEach((node: any) => {
            let partName = node.name().replace('clipart-', '');
            
            // Group eyes together
            if (partName.toLowerCase().includes('eye')) {
                partName = 'eyes';
            }

            if (!partData.has(partName)) {
                partData.set(partName, { color: node.fill(), nodes: [] });
            }
            partData.get(partName)!.nodes.push(node);
        });

        return Array.from(partData.entries()).map(([name, data]) => ({
            name,
            initialColor: data.color,
        }));
    }, [selectedNode]);

    const [partColors, setPartColors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (selectedNode) {
            const initialColors = parts.reduce((acc, part) => {
                acc[part.name] = part.initialColor;
                return acc;
            }, {} as { [key: string]: string });
            setPartColors(initialColors);
        }
    }, [selectedNode, parts]);

    const handleColorChange = (partName: string, color: string) => {
        setPartColors(prev => ({ ...prev, [partName]: color }));
        handleClipartPartColorChange(partName, color);
    };

    if (!selectedNode || parts.length === 0) {
        return <div className="p-2 text-center text-sm text-gray-500">No editable parts.</div>;
    }
    
    // Simple title case for labels
    const formatPartName = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    return (
        <div className="flex flex-col gap-4 p-2">
            <h4 className="text-sm font-medium text-center mb-2">Clipart Colors</h4>
            
            {parts.map(part => (
                <div key={part.name} className="color-picker-container-inline justify-between">
                    <label className="block text-sm font-medium text-gray-700">{formatPartName(part.name)}</label>
                    <div className="relative">
                        <div className="color-preview-circle" style={{ backgroundColor: partColors[part.name] || '#000000' }}></div>
                        <input 
                            type="color" 
                            value={partColors[part.name] || '#000000'} 
                            onChange={(e) => handleColorChange(part.name, e.target.value)} 
                            className="color-picker-input-hidden" 
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ClipartPropertiesPanel;
