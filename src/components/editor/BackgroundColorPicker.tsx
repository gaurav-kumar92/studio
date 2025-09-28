
'use client';

import React from 'react';

type BackgroundColorPickerProps = {
  defaultValue?: string;
  onChange: (color: string) => void;
};

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  defaultValue = '#ffffff',
  onChange,
}) => {
  const [color, setColor] = React.useState(defaultValue);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="mb-4">
      <div className="color-picker-container-inline">
        <label
          htmlFor="background-color-picker"
          className="block text-sm font-medium text-gray-700 mr-4"
        >
          Background Color
        </label>
        <div
          id="color-preview-background"
          className="color-preview-circle"
          style={{ backgroundColor: color }}
        ></div>
        <input
          type="color"
          id="background-color-picker"
          value={color}
          onChange={handleColorChange}
          className="color-picker-input-hidden"
        />
      </div>
    </div>
  );
};

export default BackgroundColorPicker;
