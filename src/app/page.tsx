
'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// This is a global declaration for the Konva object.
// It's a way to tell TypeScript that 'Konva' will be available on the window object
// at runtime, even though we can't import it directly as a module.
declare global {
  interface Window {
    Konva: any;
  }
}


export default function KonvaEditor() {
  
  const initializeKonva = () => {
    // Check if Konva is loaded and if we're in a browser environment
    if (typeof window === 'undefined' || typeof window.Konva === 'undefined') {
        return;
    }

    // --- 1. Element References ---
    const canvasContainer = document.getElementById('canvas-container') as HTMLElement;
    const addTextBtn = document.getElementById('add-text-btn');
    const addCircularTextBtn = document.getElementById('add-circular-text-btn');
    const addShapeBtn = document.getElementById('add-shape-btn');
    const canvasSizeSelect = document.getElementById('canvas-size') as HTMLSelectElement;
    const textDialog = document.getElementById('text-dialog') as HTMLElement;
    const shapeDialog = document.getElementById('shape-dialog') as HTMLElement;
    const circularTextDialog = document.getElementById('circular-text-dialog') as HTMLElement;
    const cancelShapeBtn = document.getElementById('cancel-shape-btn');
    const dialogTitle = document.getElementById('dialog-title');
    const textInput = document.getElementById('text-input') as HTMLInputElement;
    const circularTextInput = document.getElementById('circular-text-input') as HTMLInputElement;
    const circularTextRadius = document.getElementById('circular-text-radius') as HTMLInputElement;
    const circularTextCurvature = document.getElementById('circular-text-curvature') as HTMLInputElement; // NEW CURVATURE SLIDER
    const addBtn = document.getElementById('add-btn');
    const addCircularBtn = document.getElementById('add-circular-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const cancelCircularBtn = document.getElementById('cancel-circular-btn');
    const deleteBtn = document.getElementById('delete-btn') as HTMLElement;
    const saveBtn = document.getElementById('save-btn');
    const colorPreviewText = document.getElementById('color-preview-text') as HTMLElement;
    const colorPreviewShape = document.getElementById('color-preview-shape') as HTMLElement;
    const colorPreviewCircular = document.getElementById('color-preview-circular') as HTMLElement;
    const colorPreviewBackground = document.getElementById('color-preview-background') as HTMLElement;
    const textFontSizeInput = document.getElementById('text-font-size') as HTMLInputElement;
    const textFontFamilySelect = document.getElementById('text-font-family') as HTMLSelectElement;
    const textColorPicker = document.getElementById('text-color-picker') as HTMLInputElement;
    const shapeColorPicker = document.getElementById('shape-color-picker') as HTMLInputElement;
    const circularColorPicker = document.getElementById('circular-color-picker') as HTMLInputElement;
    const backgroundColorPicker = document.getElementById('background-color-picker') as HTMLInputElement;
    const boldBtn = document.getElementById('bold-btn') as HTMLElement;
    const italicBtn = document.getElementById('italic-btn') as HTMLElement;
    const underlineBtn = document.getElementById('underline-btn') as HTMLElement;
    const shadowControls = document.getElementById('shadow-controls') as HTMLElement;
    const shadowBlurSlider = document.getElementById('shadow-blur-slider') as HTMLInputElement;
    const shadowDistanceSlider = document.getElementById('shadow-distance-slider') as HTMLInputElement;
    const shadowOpacitySlider = document.getElementById('shadow-opacity-slider') as HTMLInputElement;
    const dropShadowBtn = document.getElementById('drop-shadow-btn') as HTMLElement;

    const alignmentControl = document.getElementById('alignment-control') as HTMLElement;
    const verticalAlignmentSlider = document.getElementById('vertical-alignment-slider') as HTMLInputElement;
    const shadowBlurValue = document.getElementById('shadow-blur-value');
    const shadowDistanceValue = document.getElementById('shadow-distance-value');
    const shadowOpacityValue = document.getElementById('shadow-opacity-value');

    // --- 2. Global State Variables ---
    let stage: any, layer: any, canvasBackground: any, tr: any; // Konva objects
    let selectedNode: any = null;
    let currentCanvasSize = '500x500';
    let originalSelectedNodeY: number | null = null;

    // Initialize colors from pickers
    let selectedColorText = textColorPicker.value;
    let selectedColorShape = shapeColorPicker.value;
    let selectedColorCircular = circularColorPicker.value;
    let selectedColorBackground = backgroundColorPicker.value;

    // --- 3. UI Helper Functions ---
    const deselectNode = () => {
      const transformer = stage?.findOne('Transformer');
      if (transformer) {
        transformer.destroy();
      }
      selectedNode = null;
      deleteBtn.classList.add('hidden');
      alignmentControl.classList.add('hidden');
      originalSelectedNodeY = null;
      layer?.draw();
    };

    const resetTextDialog = () => {
      if(dialogTitle) dialogTitle.textContent = 'Add Text to Canvas';
      if(addBtn) addBtn.textContent = 'Add';
      if(textInput) textInput.value = '';
      if(textFontSizeInput) textFontSizeInput.value = '24';
      if(textFontFamilySelect) textFontFamilySelect.value = 'Inter';
      if(textColorPicker) textColorPicker.value = '#000000';
      if(colorPreviewText) colorPreviewText.style.backgroundColor = '#000000'; // Reset visible swatch
      selectedColorText = '#000000';
      boldBtn.classList.remove('active');
      italicBtn.classList.remove('active');
underlineBtn.classList.remove('active');
      dropShadowBtn?.classList.remove('active');
      shadowControls.classList.add('hidden');
    };

    // --- 4. Core Button Listeners (Dialog Control) ---
    addTextBtn?.addEventListener('click', () => { deselectNode(); resetTextDialog(); textDialog.style.display = 'flex'; });
    addCircularTextBtn?.addEventListener('click', () => {
      deselectNode();
      // Reset circular text dialog on open
      if(circularTextInput) circularTextInput.value = 'Konva Circular Text Tool';
      if(circularTextRadius) circularTextRadius.value = '150';
      if(circularTextCurvature) circularTextCurvature.value = '100'; // Default to full wrap
      if(circularColorPicker) circularColorPicker.value = '#000000'; // Reset color
      if(colorPreviewCircular) colorPreviewCircular.style.backgroundColor = '#000000';
      selectedColorCircular = '#000000';
      circularTextDialog.style.display = 'flex';
    });
    addShapeBtn?.addEventListener('click', () => { deselectNode(); shapeDialog.style.display = 'flex'; });
    cancelShapeBtn?.addEventListener('click', () => { shapeDialog.style.display = 'none'; });
    cancelBtn?.addEventListener('click', () => { textDialog.style.display = 'none'; });
    cancelCircularBtn?.addEventListener('click', () => { circularTextDialog.style.display = 'none'; });


    // --- 5. Konva Initialization ---
    if (typeof window.Konva === 'undefined') {
      console.error('Konva library is not loaded. Canvas features are disabled.');
      return;
    }

    try {
      // Get the parent container for sizing
      const parentContainer = canvasContainer.parentElement as HTMLElement;
      
      stage = new window.Konva.Stage({
        container: 'canvas-container',
        width: parentContainer.clientWidth,
        height: parentContainer.clientHeight,
      });
      layer = new window.Konva.Layer();
      stage.add(layer);

      canvasBackground = new window.Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: selectedColorBackground,
        name: 'background'
      });
      layer.add(canvasBackground);
      layer.draw();

      // --- 6. Konva Dependent Functions ---

      const resizeCanvas = (size: string) => {
          currentCanvasSize = size;
          let [targetWidth, targetHeight] = size.split('x').map(Number);
          const parentContainer = canvasContainer.parentElement as HTMLElement;

          const parentWidth = parentContainer.clientWidth;
          const parentHeight = parentContainer.clientHeight;
          
          const targetRatio = targetWidth / targetHeight;
          const parentRatio = parentWidth / parentHeight;
          
          let newWidth, newHeight;
          
          // Determine the new dimensions based on the limiting factor (width or height)
          if (parentRatio > targetRatio) {
              // Parent is wider than target, so height is the limiter
              newHeight = parentHeight;
              newWidth = parentHeight * targetRatio;
          } else {
              // Parent is taller than target, so width is the limiter
              newWidth = parentWidth;
              newHeight = parentWidth / targetRatio;
          }

          // Update the Konva stage and background dimensions
          stage.width(newWidth);
          stage.height(newHeight);
          canvasBackground.width(newWidth);
          canvasBackground.height(newHeight);
          stage.draw();
      };

      /**
       * Implements the vertical alignment logic.
       */
      const handleVerticalAlignment = (sliderValue: number) => {
        if (!selectedNode || originalSelectedNodeY === null) return;

        // Max displacement from center (in pixels).
        const MAX_DISPLACEMENT_PX = 100;

        // Calculate a relative value from -50 (at 0) to +50 (at 100)
        const relativeValue = sliderValue - 50;

        // Slider 0 (Lower) -> displacementY +100 (Moves Down)
        // Slider 100 (Upper) -> displacementY -100 (Moves Up)
        const displacementY = -(relativeValue / 50) * MAX_DISPLACEMENT_PX;

        const newY = originalSelectedNodeY + displacementY;
        selectedNode.y(newY);
        layer.draw();
      };

      const updateSelectedTextStyle = () => {
        if (!selectedNode || selectedNode.name() !== 'text') return;

        const isBold = boldBtn.classList.contains('active');
        const isItalic = italicBtn.classList.contains('active');
        selectedNode.fontStyle(`${isBold ? 'bold ' : ''}${isItalic ? 'italic' : ''}`.trim());
        selectedNode.textDecoration(underlineBtn.classList.contains('active') ? 'underline' : '');

        const isShadowActive = dropShadowBtn?.classList.contains('active');
        if (isShadowActive) {
          selectedNode.shadowColor('#000000');
          selectedNode.shadowBlur(Number(shadowBlurSlider.value));
          selectedNode.shadowOffset({ x: Number(shadowDistanceSlider.value), y: Number(shadowDistanceSlider.value) });
          selectedNode.shadowOpacity(Number(shadowOpacitySlider.value));
        } else {
          selectedNode.shadowColor('');
          selectedNode.shadowBlur(0);
          selectedNode.shadowOffset({ x: 0, y: 0 });
          selectedNode.shadowOpacity(0);
        }
        layer.draw();
      };


      const addText = () => {
        const textValue = textInput.value || 'New Text';
        const fontSize = Number(textFontSizeInput.value);
        const fontFamily = textFontFamilySelect.value;
        const isBold = boldBtn.classList.contains('active');
        const isItalic = italicBtn.classList.contains('active');

        const newText = new window.Konva.Text({
          text: textValue,
          x: stage.width() / 4,
          y: stage.height() / 4,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fill: selectedColorText,
          draggable: true,
          fontStyle: `${isBold ? 'bold ' : ''}${isItalic ? 'italic' : ''}`.trim(),
          textDecoration: underlineBtn.classList.contains('active') ? 'underline' : '',
          name: 'text',
        });

        layer.add(newText);
        layer.draw();
        textDialog.style.display = 'none';
      };

      const addCircularText = () => {
        const textValue = circularTextInput.value.trim() || 'Curved Text';
        const radius = Number(circularTextRadius.value);
        const curvatureValue = Number(circularTextCurvature.value);
        const color = selectedColorCircular;

        // Font size scales with radius, with a minimum of 10pt for readability
        const fontSize = Math.max(10, Math.floor(radius / 5));

        // Kerning factor to adjust straight text (curvature ~ 0) spacing. 
        const STRAIGHT_KERNING_FACTOR = 0.85;

        if (!textValue) return;

        const circularGroup = new window.Konva.Group({
          x: stage.width() / 2,
          y: stage.height() / 2,
          draggable: true,
          name: 'circularText',
          'data-curvature': curvatureValue, // Store curvature value
          'data-text': textValue, // Store text value for potential future editing
          'data-radius': radius,
        });

        const tempText = new window.Konva.Text({ text: textValue, fontSize: fontSize, fontFamily: 'Inter' });
        const charHeight = tempText.height();

        // --- Dynamic Curvature Logic ---

        // Total angle in radians the text should span. 
        const maxAngleRadians = 2 * Math.PI * (curvatureValue / 100);

        // Get total flat width (before kerning adjustment)
        let totalFlatWidth = 0;
        for (const char of textValue) {
          tempText.text(char);
          totalFlatWidth += tempText.width();
        }

        // Angle subtended by the flat text if placed on the circle
        const totalFlatAngle = totalFlatWidth / radius;

        // Scale factor to compress/expand the text to fit the maxAngleRadians arc
        const scaleFactor = (totalFlatAngle > 0 && maxAngleRadians > 0) ? maxAngleRadians / totalFlatAngle : 0;

        let cumulativeAngle = 0;
        let linearOffset = 0; // Used only for straight line placement

        for (let i = 0; i < textValue.length; i++) {
          const char = textValue[i];
          tempText.text(char);
          let charWidth = tempText.width();

          // Apply kerning factor for straight text
          const adjustedCharWidth = (curvatureValue < 1) ? charWidth * STRAIGHT_KERNING_FACTOR : charWidth;

          // Angular width of the character
          const charAngularWidth = charWidth / radius;

          // Scaled angular width (will be 0 if scaleFactor is 0)
          const scaledAngularWidth = charAngularWidth * scaleFactor;
          const centerAngle = cumulativeAngle + (scaledAngularWidth / 2);

          let x, y, rotationDegrees, offsetX;

          if (curvatureValue < 1) { // Treat 0 curvature as strictly linear
            // Linear placement for straight text
            x = linearOffset;
            y = 0;
            rotationDegrees = 0;
            offsetX = 0; // Align character to the start of its linear space
            linearOffset += adjustedCharWidth; // Use adjusted width for spacing

          } else {
            // Polar placement for curved text
            const placementAngle = centerAngle - (Math.PI / 2); // Start rotation from top
            x = radius * Math.cos(placementAngle);
            y = radius * Math.sin(placementAngle);
            rotationDegrees = centerAngle * 180 / Math.PI;
            offsetX = charWidth / 2; // Center character on its radial line

            cumulativeAngle += scaledAngularWidth;
          }


          const charNode = new window.Konva.Text({
            text: char,
            x: x,
            y: y,
            fill: color,
            fontSize: fontSize,
            fontFamily: 'Inter',
            rotation: rotationDegrees,
            offsetX: offsetX,
            offsetY: charHeight / 2,
          });

          circularGroup.add(charNode);
        }

        let finalFlatWidth = totalFlatWidth; // Default to unkerned width
        if (curvatureValue < 1) {
          // Recalculate total width based on adjusted spacing
          finalFlatWidth = linearOffset;
          // Center the straight text group horizontally
          circularGroup.offsetX(finalFlatWidth / 2);
          circularGroup.rotation(0);
        } else {
          // Center the curved text group by rotating it back half the total angle
          const totalArcWidth = cumulativeAngle;
          circularGroup.rotation(-totalArcWidth * 180 / (2 * Math.PI));
        }


        layer.add(circularGroup);
        circularTextDialog.style.display = 'none';
        layer.draw();
      };

      const addShape = (type: string) => {
        let newShape;
        const x = stage.width() / 4;
        const y = stage.height() / 4;
        const size = 100;
        const color = selectedColorShape;

        switch (type) {
          case 'rect':
            newShape = new window.Konva.Rect({ x, y, width: size, height: size, fill: color, draggable: true, name: 'shape' });
            break;
          case 'circle':
            newShape = new window.Konva.Circle({ x, y, radius: size / 2, fill: color, draggable: true, name: 'shape' });
            break;
          case 'triangle':
            newShape = new window.Konva.RegularPolygon({ x, y, sides: 3, radius: size / 2, fill: color, draggable: true, name: 'shape' });
            break;
          case 'line':
            newShape = new window.Konva.Line({ points: [x, y, x + size, y], stroke: color, strokeWidth: 5, draggable: true, name: 'shape' });
            break;
        }
        if(newShape) layer.add(newShape);
        layer.draw();
      };

      const updateText = () => {
        if (selectedNode && selectedNode.name() === 'text') {
          selectedNode.text(textInput.value);
          selectedNode.fontSize(Number(textFontSizeInput.value));
          selectedNode.fontFamily(textFontFamilySelect.value);
          selectedNode.fill(textColorPicker.value);
          updateSelectedTextStyle();
          layer.draw();
        }
      };

      // --- 7. Konva Dependent Event Handlers ---

      // Initial resize
      resizeCanvas(canvasSizeSelect.value); 
      // Attach listeners
      window.addEventListener('resize', () => { resizeCanvas(currentCanvasSize); });
      canvasSizeSelect.addEventListener('change', e => resizeCanvas((e.target as HTMLSelectElement).value));
      

      verticalAlignmentSlider?.addEventListener('input', (event) => {
        handleVerticalAlignment(Number((event.target as HTMLInputElement).value));
      });

      // Color Picker Logic (Update state variables and visible swatch)
      textColorPicker?.addEventListener('input', e => {
        selectedColorText = (e.target as HTMLInputElement).value;
        if(colorPreviewText) colorPreviewText.style.backgroundColor = selectedColorText;
      });
      shapeColorPicker?.addEventListener('input', e => {
        selectedColorShape = (e.target as HTMLInputElement).value;
        if(colorPreviewShape) colorPreviewShape.style.backgroundColor = selectedColorShape;
      });
      circularColorPicker?.addEventListener('input', e => {
        selectedColorCircular = (e.target as HTMLInputElement).value;
        if(colorPreviewCircular) colorPreviewCircular.style.backgroundColor = selectedColorCircular;
      });
      backgroundColorPicker?.addEventListener('input', e => {
        selectedColorBackground = (e.target as HTMLInputElement).value;
        if(colorPreviewBackground) colorPreviewBackground.style.backgroundColor = selectedColorBackground;
        if(canvasBackground) {
            canvasBackground.fill(selectedColorBackground);
            layer.draw();
        }
      });

      // Text Dialog Update/Add
      addBtn?.addEventListener('click', () => {
        if (addBtn.textContent === 'Add') {
          addText();
        } else if (addBtn.textContent === 'Update') {
          updateText();
          textDialog.style.display = 'none';
        }
      });

      // Circular Text Add
      addCircularBtn?.addEventListener('click', addCircularText);

      // Shape Dialog Selection
      shapeDialog?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const shapeType = target.closest('[data-shape]')?.getAttribute('data-shape');
        if (shapeType) {
          addShape(shapeType);
          shapeDialog.style.display = 'none';
        }
      });

      // Text Format Handlers
      boldBtn?.addEventListener('click', () => { boldBtn.classList.toggle('active'); updateSelectedTextStyle(); });
      italicBtn?.addEventListener('click', () => { italicBtn.classList.toggle('active'); updateSelectedTextStyle(); });
      underlineBtn?.addEventListener('click', () => { underlineBtn.classList.toggle('active'); updateSelectedTextStyle(); });

      // Shadow Controls
      dropShadowBtn?.addEventListener('click', () => {
        dropShadowBtn.classList.toggle('active');
        shadowControls.classList.toggle('hidden', !dropShadowBtn.classList.contains('active'));
        updateSelectedTextStyle();
      });

      shadowBlurSlider?.addEventListener('input', () => {
        if(shadowBlurValue) shadowBlurValue.textContent = shadowBlurSlider.value;
        updateSelectedTextStyle();
      });
      shadowDistanceSlider?.addEventListener('input', () => {
        if(shadowDistanceValue) shadowDistanceValue.textContent = shadowDistanceSlider.value;
        updateSelectedTextStyle();
      });
      shadowOpacitySlider?.addEventListener('input', () => {
        if(shadowOpacityValue) shadowOpacityValue.textContent = shadowOpacitySlider.value;
        updateSelectedTextStyle();
      });

      deleteBtn?.addEventListener('click', () => {
        if (selectedNode) {
          selectedNode.destroy();
          deselectNode();
        }
      });

      saveBtn?.addEventListener('click', () => {
        deselectNode();
        const dataURL = stage.toDataURL({ mimeType: "image/png", quality: 1 });
        const link = document.createElement('a');
        link.download = 'konva-design.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // --- Selection and Transformation Logic ---
      stage.on('click tap', (e: any) => {
        // Check if clicking outside objects
        if (e.target === stage || e.target === canvasBackground) {
          deselectNode();
          return;
        }

        let nodeToTransform = e.target;

        // If a character in a circular group is clicked, select the parent group
        if (e.target.parent?.hasName('circularText')) {
          nodeToTransform = e.target.parent;
        }

        if (nodeToTransform.hasName('text') || nodeToTransform.hasName('shape') || nodeToTransform.hasName('circularText')) {
          deselectNode();

          selectedNode = nodeToTransform;
          deleteBtn.classList.remove('hidden');

          // Show alignment control 
          alignmentControl.classList.remove('hidden');

          // SET INITIAL STATE FOR SLIDER
          originalSelectedNodeY = selectedNode.y();
          if(verticalAlignmentSlider) verticalAlignmentSlider.value = '50';

          tr = new window.Konva.Transformer({ rotateEnabled: true });
          layer.add(tr);
          tr.nodes([nodeToTransform]);

          if (nodeToTransform.hasName('text')) {
            // Populate dialog for editing
            if(dialogTitle) dialogTitle.textContent = 'Update Text';
            if(addBtn) addBtn.textContent = 'Update';
            if(textInput) textInput.value = nodeToTransform.text();
            if(textFontSizeInput) textFontSizeInput.value = nodeToTransform.fontSize();
            if(textFontFamilySelect) textFontFamilySelect.value = nodeToTransform.fontFamily();
            if(textColorPicker) textColorPicker.value = nodeToTransform.fill();
            if(colorPreviewText) colorPreviewText.style.backgroundColor = nodeToTransform.fill(); // Update visible swatch
          }

          layer.draw();

          // Update original Y position after drag ends so the slider position (50) remains center.
          nodeToTransform.on('dragend', () => {
            originalSelectedNodeY = nodeToTransform.y();
            if(verticalAlignmentSlider) verticalAlignmentSlider.value = '50';
            layer.draw();
          });
        }
      });
    } catch (error) {
      console.error("CRITICAL KONVA ERROR: Failed to initialize Konva components (stage/layer).", error);
    }
  };
  
  useEffect(() => {
    // This effect hook runs once after the component mounts.
    // We check if the Konva script has already been loaded by a previous render.
    // If it has, we initialize the editor. If not, the `onLoad` prop of the <Script>
    // component will handle the initialization once the script is fetched.
    if ((window as any).Konva) {
      initializeKonva();
    }
  }, []);


  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/konva@9.3.6/konva.min.js"
        strategy="lazyOnload"
        onLoad={initializeKonva}
      />
      <main>
        <div id="editor-ui">
            <h2 className="text-xl font-semibold text-center mb-4">Canvas Editor</h2>
            
            <div className="relative-canvas">
                <div id="canvas-container"></div>
            </div>
            
            <div id="controls" className="bg-white p-4 rounded-xl shadow-lg mt-4">
                <div className="mb-4">
                    <label htmlFor="canvas-size" className="block text-sm font-medium text-gray-700 mb-2">Select Canvas Size</label>
                    <select id="canvas-size" className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="500x500">Square (500x500)</option>
                        <option value="375x667">Phone (375x667)</option>
                        <option value="1920x1080">HD Screen (1920x1080)</option>
                        <option value="1366x768">Laptop (1366x768)</option>
                        <option value="842x1191">A4 (842x1191)</option>
                        <option value="1191x1684">A3 (1191x1684)</option>
                        <option value="595x842">A5 (595x842)</option>
                        <option value="1684x2384">A2 (1684x2384)</option>
                        <option value="2384x3370">A1 (2384x3370)</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <div className="color-picker-container-inline">
                        <div id="color-preview-background" className="color-preview-circle" style={{backgroundColor: '#ffffff'}}></div>
                        <input type="color" id="background-color-picker" defaultValue="#ffffff" className="color-picker-input-hidden" />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                    <button id="add-text-btn" className="button button-primary flex-grow">Add Text</button>
                    <button id="add-circular-text-btn" className="button button-primary flex-grow">Add Circular Text</button>
                    <button id="add-shape-btn" className="button button-primary flex-grow">Add Shape</button>
                    <button id="delete-btn" className="button button-danger flex-grow hidden">Delete Selected</button>
                    <button id="save-btn" className="button button-primary flex-grow">Save as Image</button>
                </div>

                {/* VERTICAL ALIGNMENT SLIDER */}
                <div id="alignment-control" className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200 hidden">
                    <label htmlFor="vertical-alignment-slider" className="block text-sm font-medium text-gray-700">Vertical Alignment (Selected Item)</label>
                    <input 
                        type="range" 
                        id="vertical-alignment-slider" 
                        min="0" 
                        max="100" 
                        defaultValue="50" 
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between w-full text-xs text-gray-500">
                        <span className="text-green-600 font-semibold">Lower (0)</span>
                        <span className="text-gray-600 font-semibold">Center (50)</span>
                        <span className="text-red-600 font-semibold">Upper (100)</span>
                    </div>
                </div>

            </div>
        </div>

        {/* Text Dialog */}
        <div id="text-dialog" className="dialog-overlay">
            <div className="dialog">
                <div className="dialog-content">
                    <h3 id="dialog-title" className="text-lg font-semibold">Add Text to Canvas</h3>
                    <input type="text" id="text-input" className="dialog-input p-2 border rounded-md w-full mb-4" placeholder="Enter your text..." />
                    
                    <div id="text-controls" className="mt-4 pt-4 relative">
                        
                        {/* SINGLE COLOR INPUT (Circle Swatch) */}
                        <div className="color-picker-container">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                            {/* VISIBLE SWATCH */}
                            <div id="color-preview-text" className="color-preview-circle" style={{backgroundColor: '#000000'}}></div>
                            {/* HIDDEN FUNCTIONAL INPUT */}
                            <input type="color" id="text-color-picker" defaultValue="#000000" className="color-picker-input-hidden" />
                        </div>

                        <div className="mb-4 mt-4">
                            <label htmlFor="text-font-size" className="block text-sm font-medium text-gray-700">Font Size</label>
                            <input type="number" id="text-font-size" className="w-full p-2 border rounded-md" defaultValue="24" min="12" max="100" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="text-font-family" className="block text-sm font-medium text-gray-700">Font Family</label>
                            <select id="text-font-family" className="w-full p-2 border border-gray-300 rounded-md">
                                <option value="Inter">Inter</option>
                                <option value="Arial">Arial</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Impact">Impact</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Font Style</label>
                            <div className="flex gap-2 justify-center">
                                <button id="bold-btn" className="p-2 border rounded-md font-bold">B</button>
                                <button id="italic-btn" className="p-2 border rounded-md italic">I</button>
                                <button id="underline-btn" className="p-2 border rounded-md underline">U</button>
                                <button id="drop-shadow-btn" className="p-2 border rounded-md shadow-sm">Shadow</button>
                            </div>
                        </div>
                        <div id="shadow-controls" className="flex flex-col gap-2 mt-4 hidden">
                             <label className="block text-sm font-medium text-gray-700">Shadow Blur (Current: <span id="shadow-blur-value">10</span>)</label>
                            <input type="range" id="shadow-blur-slider" min="0" max="20" defaultValue="10" />
                             <label className="block text-sm font-medium text-gray-700">Shadow Distance (Current: <span id="shadow-distance-value">5</span>)</label>
                            <input type="range" id="shadow-distance-slider" min="0" max="20" defaultValue="5" />
                             <label className="block text-sm font-medium text-gray-700">Shadow Opacity (Current: <span id="shadow-opacity-value">0.5</span>)</label>
                            <input type="range" id="shadow-opacity-slider" min="0" max="1" step="0.1" defaultValue="0.5" />
                        </div>
                    </div>
                    
                    <div className="dialog-actions flex justify-end gap-2 mt-4">
                        <button id="cancel-btn" className="dialog-button dialog-button-secondary">Cancel</button>
                        <button id="add-btn" className="dialog-button dialog-button-primary">Add</button>
                    </div>
                </div>
            </div>
        </div>

        {/* Shape Dialog */}
        <div id="shape-dialog" className="dialog-overlay">
            <div className="dialog">
                <h3 className="text-lg font-semibold mb-4">Add a Shape</h3>
                 {/* SINGLE COLOR INPUT (Circle Swatch) */}
                 <div className="color-picker-container">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shape Color</label>
                    {/* VISIBLE SWATCH */}
                    <div id="color-preview-shape" className="color-preview-circle" style={{backgroundColor: '#3b82f6'}}></div>
                    {/* HIDDEN FUNCTIONAL INPUT */}
                    <input type="color" id="shape-color-picker" defaultValue="#3b82f6" className="color-picker-input-hidden" />
                </div>

                <div className="shape-button-container mt-4">
                    <button id="rect-btn" className="button-primary p-2 rounded-lg font-semibold" data-shape="rect">Rect</button>
                    <button id="circle-btn" className="button-primary p-2 rounded-lg font-semibold" data-shape="circle">Circle</button>
                    <button id="triangle-btn" className="button-primary p-2 rounded-lg font-semibold" data-shape="triangle">Tri</button>
                    <button id="line-btn" className="button-primary p-2 rounded-lg font-semibold" data-shape="line">Line</button>
                </div>
                <div className="dialog-actions mt-4">
                    <button id="cancel-shape-btn" className="dialog-button dialog-button-secondary">Cancel</button>
                </div>
            </div>
        </div>

        {/* Circular Text Dialog */}
        <div id="circular-text-dialog" className="dialog-overlay">
            <div className="dialog">
                <div className="dialog-content">
                    <h3 className="text-lg font-semibold">Add Circular Text</h3>
                    <input type="text" id="circular-text-input" className="dialog-input p-2 border rounded-md w-full mb-4" placeholder="Enter your text..." defaultValue="Konva Circular Text Tool" />
                    <div className="mt-4 pt-4">
                        <div className="mb-4 flex items-center justify-between">
                            <label htmlFor="circular-text-radius" className="block text-sm font-medium text-gray-700">Radius</label>
                            {/* CHANGED: Min radius set back to 10 */}
                            <input type="range" id="circular-text-radius" min="10" max="250" defaultValue="150" className="flex-grow ml-4" />
                        </div>
                        
                        {/* NEW CURVATURE SLIDER */}
                        <div className="mb-4 flex flex-col items-start w-full">
                            <label htmlFor="circular-text-curvature" className="block text-sm font-medium text-gray-700 mb-2">Curvature</label>
                            <input type="range" id="circular-text-curvature" min="0" max="100" defaultValue="100" className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer" />
                            <div className="flex justify-between w-full text-xs text-gray-500 mt-1">
                                <span className="text-gray-600 font-semibold">Straight (0)</span>
                                <span className="text-gray-600 font-semibold">Full Wrap (100)</span>
                            </div>
                        </div>

                        {/* SINGLE COLOR INPUT (Circle Swatch) */}
                        <div className="color-picker-container">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                            {/* VISIBLE SWATCH */}
                            <div id="color-preview-circular" className="color-preview-circle" style={{backgroundColor: '#000000'}}></div>
                            {/* HIDDEN FUNCTIONAL INPUT */}
                            <input type="color" id="circular-color-picker" defaultValue="#000000" className="color-picker-input-hidden" />
                        </div>
                    </div>
                    <div className="dialog-actions flex justify-end gap-2 mt-4">
                        <button id="cancel-circular-btn" className="dialog-button dialog-button-secondary">Cancel</button>
                        <button id="add-circular-btn" className="dialog-button dialog-button-primary">Add</button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </>
  );
}

    