

'use client';

import React from 'react';

type LayersPanelProps = {
    layers: any[];
    selectedNode: any;
    onSelectNode: (nodeId: string) => void;
    onMoveNode: (action: 'up' | 'down', nodeId: string) => void;
};

const LayersPanel: React.FC<LayersPanelProps> = ({ layers, selectedNode, onSelectNode, onMoveNode }) => {
    
    const getLayerNameAndIcon = (node: any) => {
        let iconSvg = '';
        let name = 'Object';

        if (node.hasName('textGroup') || node.hasName('circularText')) {
            const textContent = node.getAttr('data-text') || '';
            iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`;
            name = node.hasName('textGroup') ? `Text: "${textContent.substring(0, 15)}..."` : `Curved Text`;
        } else if (node.hasName('shape')) {
            const shapeType = node.getAttr('data-type');
            iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
            name = `Shape: ${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`;
        } else if (node.hasName('image')) {
            iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
            name = 'Image';
        } else if (node.hasName('frame')) {
            const frameType = node.getAttr('data-type');
            iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`;
            name = `Frame: ${frameType.charAt(0).toUpperCase() + frameType.slice(1)}`;
        } else if (node.hasName('mask')) {
            const maskType = node.getAttr('data-type');
            iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 0 0 7.5 7.5v-15A7.5 7.5 0 0 0 4.5 12z"/></svg>`;
            let namePrefix = `Mask: ${maskType.charAt(0).toUpperCase() + maskType.slice(1)}`;
             if (maskType === 'alphabet') {
                name = `${namePrefix} '${node.getAttr('data-letter')}'`;
            } else {
                name = namePrefix;
            }
        }
        return { iconSvg, name };
    };

    const reversedLayers = layers.slice().reverse();

    return (
        <div id="layers-panel">
            <h3 className="text-lg font-semibold mb-4 text-center">Layers</h3>
            <ul id="layers-list">
                {reversedLayers.map((node: any, index: number) => {
                    const { iconSvg, name } = getLayerNameAndIcon(node);
                    const isSelected = selectedNode && selectedNode.id() === node.id();
                    const nodeCount = reversedLayers.length;

                    return (
                        <li
                            key={`${node.id()}-${index}`}
                            className={`layer-item ${isSelected ? 'selected' : ''}`}
                            data-id={node.id()}
                        >
                            <div className="layer-info" onClick={() => onSelectNode(node.id())}>
                                <div dangerouslySetInnerHTML={{ __html: iconSvg }} />
                                <span className="name">{name}</span>
                            </div>
                            <div className="layer-actions">
                                <button
                                    className="layer-action-btn"
                                    title="Move Up"
                                    disabled={index === 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveNode('up', node.id());
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5l6 6h-3v6h-6v-6H6z"/></svg>
                                </button>
                                <button
                                    className="layer-action-btn"
                                    title="Move Down"
                                    disabled={index === nodeCount - 1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMoveNode('down', node.id());
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l-6-6h3V7h6v6h3z"/></svg>
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default LayersPanel;
