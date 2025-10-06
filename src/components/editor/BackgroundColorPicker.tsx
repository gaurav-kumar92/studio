// src/components/editor/BackgroundColorPicker.tsx

'use client';

import React from 'react';
import ColorPropertiesPanel from './ColorPropertiesPanel';

type BackgroundColorPickerProps = {
  // The 'defaultValue' is no longer needed as we'll manage state in the context
  onChange: (config: any) => void;
  // We don't have a 'selectedNode' for the background, so we make a fake one
  // to satisfy the props of ColorPropertiesPanel.
  value: any;
};

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  onChange,
  value,
}) => {
  // Create a mock `selectedNode` with the necessary attributes
  // that ColorPropertiesPanel expects to read.
  const mockNode = {
    name: () => 'background',
    getAttr: (attr: string) => {
      switch (attr) {
        case 'data-is-gradient':
          return value.isGradient;
        case 'data-solid-color':
          return value.solidColor;
        case 'data-color-stops':
          return value.colorStops;
        case 'data-gradient-direction':
          return value.gradientDirection;
        default:
          return undefined;
      }
    },
    // Add dummy functions that ColorPropertiesPanel might try to call
    hasName: (name: string) => name === 'background',
    findOne: () => null,
    fill: () => value.solidColor,
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Background
      </label>
      <ColorPropertiesPanel
        selectedNode={mockNode}
        onColorChange={onChange}
        isStroke={false} // Background is always a fill
      />
    </div>
  );
};

export default BackgroundColorPicker;
