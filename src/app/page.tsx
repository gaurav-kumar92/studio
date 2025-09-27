
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
    
    // Dialogs and Controls
    const addItemDialog = document.getElementById('add-item-dialog');
    const textDialog = document.getElementById('text-dialog') as HTMLElement;
    const shapeDialog = document.getElementById('shape-dialog') as HTMLElement;
    const imageDialog = document.getElementById('image-dialog') as HTMLElement;
    const frameDialog = document.getElementById('frame-dialog') as HTMLElement;

    // Buttons
    const addItemBtn = document.getElementById('add-item-btn');
    const cancelAddItemBtn = document.getElementById('cancel-add-item-btn');
    const addItemOptions = document.getElementById('add-item-options');
    const cancelShapeBtn = document.getElementById('cancel-shape-btn');
    const addShapeBtn = document.getElementById('add-shape-btn');
    const cancelTextBtn = document.getElementById('cancel-btn');
    const cancelImageBtn = document.getElementById('cancel-image-btn');
    const cancelFrameBtn = document.getElementById('cancel-frame-btn');
    const addTextBtn = document.getElementById('add-btn');
    const addImageBtn = document.getElementById('add-image-btn');
    const deleteBtn = document.getElementById('delete-btn') as HTMLElement;
    const saveBtn = document.getElementById('save-btn');

    // Canvas & Background
    const canvasSizeSelect = document.getElementById('canvas-size') as HTMLSelectElement;
    const colorPreviewBackground = document.getElementById('color-preview-background') as HTMLElement;
    const backgroundColorPicker = document.getElementById('background-color-picker') as HTMLInputElement;
    
    // Text Specific
    const dialogTitle = document.getElementById('dialog-title');
    const textInput = document.getElementById('text-input') as HTMLInputElement;
    const textFontSizeInput = document.getElementById('text-font-size') as HTMLInputElement;
    const textFontFamilySelect = document.getElementById('text-font-family') as HTMLSelectElement;
    const textColorPicker = document.getElementById('text-color-picker') as HTMLInputElement;
    const colorPreviewText = document.getElementById('color-preview-text') as HTMLElement;
    const circularTextRadius = document.getElementById('circular-text-radius') as HTMLInputElement;
    const circularTextCurvature = document.getElementById('circular-text-curvature') as HTMLInputElement;
    const boldBtn = document.getElementById('bold-btn') as HTMLElement;
    const italicBtn = document.getElementById('italic-btn') as HTMLElement;
    const underlineBtn = document.getElementById('underline-btn') as HTMLElement;
    const strikethroughBtn = document.getElementById('strikethrough-btn') as HTMLElement;
    const dropShadowBtn = document.getElementById('drop-shadow-btn') as HTMLElement;
    const shadowControls = document.getElementById('shadow-controls') as HTMLElement;
    const shadowBlurSlider = document.getElementById('shadow-blur-slider') as HTMLInputElement;
    const shadowDistanceSlider = document.getElementById('shadow-distance-slider') as HTMLInputElement;
    const shadowOpacitySlider = document.getElementById('shadow-opacity-slider') as HTMLInputElement;
    const shadowBlurValue = document.getElementById('shadow-blur-value');
    const shadowDistanceValue = document.getElementById('shadow-distance-value');
    const shadowOpacityValue = document.getElementById('shadow-opacity-value');
    const glowBtn = document.getElementById('glow-btn') as HTMLElement;
    const glowControls = document.getElementById('glow-controls') as HTMLElement;
    const glowBlurSlider = document.getElementById('glow-blur-slider') as HTMLInputElement;
    const glowOpacitySlider = document.getElementById('glow-opacity-slider') as HTMLInputElement;
    const glowBlurValue = document.getElementById('glow-blur-value');
    const glowOpacityValue = document.getElementById('glow-opacity-value');
    const colorPreviewGlow = document.getElementById('color-preview-glow') as HTMLElement;
    const glowColorPicker = document.getElementById('glow-color-picker') as HTMLInputElement;
    
    // Advanced Text
    const letterSpacingSlider = document.getElementById('letter-spacing-slider') as HTMLInputElement;
    const lineHeightSlider = document.getElementById('line-height-slider') as HTMLInputElement;
    const textAlignContainer = document.getElementById('text-align-container');
    
    // Shape Specific
    const shapeDialogTitle = document.getElementById('shape-dialog-title');
    const shapeButtonsContainer = document.getElementById('shape-buttons-container');
    const colorPreviewShape = document.getElementById('color-preview-shape') as HTMLElement;
    const shapeColorPicker = document.getElementById('shape-color-picker') as HTMLInputElement;
    const shapeThicknessControls = document.getElementById('shape-thickness-controls') as HTMLElement;
    const shapeThicknessSlider = document.getElementById('shape-thickness-slider') as HTMLInputElement;
    const shapeThicknessValue = document.getElementById('shape-thickness-value');
    const shapeSidesControls = document.getElementById('shape-sides-controls') as HTMLElement;
    const shapeSidesSlider = document.getElementById('shape-sides-slider') as HTMLInputElement;
    const shapeSidesValue = document.getElementById('shape-sides-value');

    // Image Specific
    const imageFileInput = document.getElementById('image-file-input') as HTMLInputElement;

    // Frame Specific
    const frameButtonsContainer = document.getElementById('frame-buttons-container');
    const frameColorPicker = document.getElementById('frame-color-picker') as HTMLInputElement;
    const colorPreviewFrame = document.getElementById('color-preview-frame') as HTMLElement;
    const frameWidthSlider = document.getElementById('frame-width-slider') as HTMLInputElement;
    const frameWidthValue = document.getElementById('frame-width-value');

    // Object Properties panel
    const objectPropertiesPanel = document.getElementById('object-properties') as HTMLElement;
    const alignTopBtn = document.getElementById('align-top-btn');
    const alignLeftBtn = document.getElementById('align-left-btn');
    const alignCenterBtn = document.getElementById('align-center-btn');
    const alignRightBtn = document.getElementById('align-right-btn');
    const alignBottomBtn = document.getElementById('align-bottom-btn');
    const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;
    const imageFiltersPanel = document.getElementById('image-filters-panel');


    // Layers Panel
    const layersList = document.getElementById('layers-list') as HTMLElement;


    // --- 2. Global State Variables ---
    let stage: any, layer: any, canvasBackground: any, tr: any; // Konva objects
    let selectedNode: any = null;
    let currentCanvasSize = '500x500';
    let activeShapeForAddition: string | null = null;
    
    // Initialize colors from pickers
    let selectedColorText = textColorPicker.value;
    let selectedColorShape = shapeColorPicker.value;
    let selectedColorBackground = backgroundColorPicker.value;
    let selectedColorFrame = frameColorPicker.value;
    let selectedColorGlow = glowColorPicker.value;

    // --- 3. UI Helper Functions ---

    const updateLayersPanel = () => {
        if (!layersList) return;
        layersList.innerHTML = ''; // Clear the list

        // Get all nodes except the background and transformer
        const nodes = layer.getChildren((node: any) => {
            return node.name() !== 'background' && node.className !== 'Transformer';
        });

        const nodeCount = nodes.length;

        // Iterate backwards to show top layer first
        nodes.reverse().forEach((node: any, index: number) => {
            const li = document.createElement('li');
            li.className = 'layer-item';
            li.setAttribute('data-id', node.id());

            let iconSvg = '';
            let name = 'Object';

            if (node.hasName('text') || node.hasName('circularText')) {
                iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`;
                name = node.hasName('text') ? `Text: "${node.text().substring(0, 15)}..."` : `Curved Text`;
            } else if (node.hasName('shape')) {
                const shapeType = node.getAttr('data-type');
                iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
                name = `Shape: ${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`;
            } else if (node.hasName('image')) {
                iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                name = 'Image';
            } else if (node.hasName('frame')) {
                const frameType = node.getAttr('data-type');
                iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`;
                name = `Frame: ${frameType.charAt(0).toUpperCase() + frameType.slice(1)}`;
            }
            
            const layerInfo = document.createElement('div');
            layerInfo.className = 'layer-info';
            layerInfo.innerHTML = `${iconSvg}<span class="name">${name}</span>`;

            layerInfo.addEventListener('click', () => {
                selectNode(node);
            });

            // Action buttons container
            const actions = document.createElement('div');
            actions.className = 'layer-actions';
            
            // Move Up Button
            const upBtn = document.createElement('button');
            upBtn.className = 'layer-action-btn';
            upBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5l6 6h-3v6h-6v-6H6z"/></svg>`;
            upBtn.title = 'Move Up';
            if (index === 0) upBtn.disabled = true; // Already at the top
            upBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                node.moveUp();
                updateLayersPanel();
                layer.draw();
            });

            // Move Down Button
            const downBtn = document.createElement('button');
            downBtn.className = 'layer-action-btn';
            downBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l-6-6h3V7h6v6h3z"/></svg>`;
            downBtn.title = 'Move Down';
            if (index === nodeCount - 1) downBtn.disabled = true; // Already at the bottom
            downBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                node.moveDown();
                updateLayersPanel();
                layer.draw();
            });
            
            actions.appendChild(upBtn);
            actions.appendChild(downBtn);
            
            li.appendChild(layerInfo);
            li.appendChild(actions);

            if (node === selectedNode) {
                li.classList.add('selected');
            }

            layersList.appendChild(li);
        });
    };
    
    const addImageToFrame = (frameGroup: any, src: string) => {
        window.Konva.Image.fromURL(src, (imageNode: any) => {
            const existingImage = frameGroup.findOne('.frame-image') || frameGroup.findOne('.frame-placeholder');
            if (existingImage) {
                existingImage.destroy();
            }

            imageNode.setAttrs({
                name: 'frame-image',
                draggable: true,
            });

            const frameShape = frameGroup.findOne('.frame-shape');
            const frameBounds = frameShape.getClientRect({ relativeTo: frameGroup });

            const ratio = Math.max(frameBounds.width / imageNode.width(), frameBounds.height / imageNode.height());
            imageNode.scale({ x: ratio, y: ratio });

            imageNode.position({
                x: frameBounds.x + (frameBounds.width - imageNode.width() * ratio) / 2,
                y: frameBounds.y + (frameBounds.height - imageNode.height() * ratio) / 2
            });

            frameGroup.add(imageNode);
            imageNode.moveToBottom();
            
            // Re-apply clip to make sure it respects new dimensions
            const type = frameGroup.getAttr('data-type');
            const size = frameShape.width() || frameShape.radius() * 2; // Approximate size
            
            frameGroup.clipFunc((ctx: any) => {
                const clipShape = frameGroup.findOne('.frame-shape');
                // Use a clone for drawing to avoid transform issues
                const clipShapeForCtx = clipShape.clone(); 
                clipShapeForCtx.drawScene(ctx);
            });


            layer.batchDraw();
            selectNode(frameGroup);
        });
    };


    const selectNode = (node: any) => {
        // If it's already selected, do nothing.
        if (node === selectedNode) {
            return;
        }

        // Clean up previous selection
        deselectNode(false); // Pass false to prevent redundant layer update

        selectedNode = node;
        deleteBtn.classList.remove('hidden');
        if (objectPropertiesPanel) objectPropertiesPanel.classList.remove('hidden');
        if (opacitySlider) opacitySlider.value = String(selectedNode.opacity());
        
        // Show/hide image filters panel
        if (imageFiltersPanel) {
            if (selectedNode.hasName('image')) {
                imageFiltersPanel.classList.remove('hidden');
            } else {
                imageFiltersPanel.classList.add('hidden');
            }
        }
        
        let nodeToTransform = node;
        if (node.hasName('frame-image')) {
            node.draggable(true);
            nodeToTransform = node.getParent(); 
            selectedNode = nodeToTransform; 
        } else if (node.hasName('frame')) {
            const internalImage = node.findOne('.frame-image');
            if (internalImage) internalImage.draggable(false);
            nodeToTransform = node; // Make sure the group is transformed
        }
        
        tr = new window.Konva.Transformer({ rotateEnabled: true });
        layer.add(tr);
        tr.nodes([nodeToTransform]);

        // Double-click handler for editing
        node.on('dblclick dbltap', () => {
             if (node.hasName('text') || node.hasName('circularText')) {
              textDialog.style.display = 'flex';
              if (dialogTitle) dialogTitle.textContent = 'Update Text';
              if (addTextBtn) addTextBtn.textContent = 'Update';

              if (node.hasName('text')) {
                  // Populate dialog for standard text
                  if(textInput) textInput.value = node.text();
                  if(textFontSizeInput) textFontSizeInput.value = node.fontSize();
                  if(textFontFamilySelect) textFontFamilySelect.value = node.fontFamily();
                  if(textColorPicker) textColorPicker.value = node.fill();
                  if(colorPreviewText) colorPreviewText.style.backgroundColor = node.fill();
                  
                  // Advanced text properties
                  if(letterSpacingSlider) letterSpacingSlider.value = node.letterSpacing();
                  if(lineHeightSlider) lineHeightSlider.value = node.lineHeight();
                  document.querySelectorAll('#text-align-container button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-align') === node.align()) {
                        btn.classList.add('active');
                    }
                  });
                  
                  // Set curvature to 0 for standard text
                  if(circularTextCurvature) circularTextCurvature.value = '0';
                  if(circularTextRadius) circularTextRadius.value = '150'; // Default radius

              } else if (node.hasName('circularText')) {
                  // Populate dialog for circular text
                  if(textInput) textInput.value = node.getAttr('data-text');
                  if(circularTextCurvature) circularTextCurvature.value = node.getAttr('data-curvature');
                  if(circularTextRadius) circularTextRadius.value = node.getAttr('data-radius');
                  if(textColorPicker) textColorPicker.value = node.getAttr('data-color');
                  if(colorPreviewText) colorPreviewText.style.backgroundColor = node.getAttr('data-color');
                  if(textFontFamilySelect) textFontFamilySelect.value = node.getAttr('data-font-family');
              }
            } else if (node.hasName('shape')) {
              shapeDialog.style.display = 'flex';
              if(shapeDialogTitle) shapeDialogTitle.textContent = 'Edit Shape';
              if(shapeButtonsContainer) shapeButtonsContainer.classList.add('hidden'); // Hide shape selection
              if(addShapeBtn) addShapeBtn.classList.add('hidden');

              const shapeColor = node.fill() || node.stroke();
              if(shapeColorPicker) shapeColorPicker.value = shapeColor;
              if(colorPreviewShape) colorPreviewShape.style.backgroundColor = shapeColor;
              selectedColorShape = shapeColor;

              const shapeType = node.getAttr('data-type');
              if (shapeType === 'line' || shapeType === 'arrow') {
                  if(shapeThicknessControls) shapeThicknessControls.classList.remove('hidden');
                  const currentThickness = node.strokeWidth();
                  if(shapeThicknessSlider) shapeThicknessSlider.value = String(currentThickness);
                  if(shapeThicknessValue) shapeThicknessValue.textContent = String(currentThickness);
              } else {
                  if(shapeThicknessControls) shapeThicknessControls.classList.add('hidden');
              }
              if (shapeType === 'polygon') {
                if(shapeSidesControls) shapeSidesControls.classList.remove('hidden');
                const currentSides = node.sides();
                if(shapeSidesSlider) shapeSidesSlider.value = String(currentSides);
                if(shapeSidesValue) shapeSidesValue.textContent = String(currentSides);
              } else {
                if(shapeSidesControls) shapeSidesControls.classList.add('hidden');
              }


            } else if (node.hasName('frame')) {
                // When a frame is double-clicked, open the image file dialog
                imageFileInput.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (!target || !target.files || target.files.length === 0) {
                        return;
                    }
                    const file = target.files[0];
                    const reader = new FileReader();
                    reader.onload = () => {
                        addImageToFrame(node, reader.result as string);
                    };
                    reader.readAsDataURL(file);

                    // Clean up to ensure it works next time
                    imageFileInput.value = '';
                    imageFileInput.onchange = null;
                };
                imageFileInput.click();
            }
        });

        updateLayersPanel();
        layer.draw();
    };

    const deselectNode = (updateLayers = true) => {
        const transformer = stage?.findOne('Transformer');
        if (transformer) {
            transformer.destroy();
        }

        // If the selected node was a frame, make its internal image non-draggable
        if (selectedNode && selectedNode.hasName('frame')) {
            const internalImage = selectedNode.findOne('.frame-image');
            if (internalImage) internalImage.draggable(false);
        }

        selectedNode = null;
        deleteBtn.classList.add('hidden');
        if (objectPropertiesPanel) objectPropertiesPanel.classList.add('hidden');
        if (imageFiltersPanel) imageFiltersPanel.classList.add('hidden');
        
        if(updateLayers) {
            updateLayersPanel();
        }

        layer?.draw();
    };
    
    const resetShapeDialog = () => {
      if(shapeDialogTitle) shapeDialogTitle.textContent = 'Add a Shape';
      if(shapeButtonsContainer) shapeButtonsContainer.classList.remove('hidden');
      if(addShapeBtn) addShapeBtn.classList.add('hidden');
      if(shapeColorPicker) shapeColorPicker.value = '#3b82f6';
      if(colorPreviewShape) colorPreviewShape.style.backgroundColor = '#3b82f6';
      selectedColorShape = '#3b82f6';
      if(shapeThicknessControls) shapeThicknessControls.classList.add('hidden');
      if(shapeThicknessSlider) shapeThicknessSlider.value = '5';
      if(shapeThicknessValue) shapeThicknessValue.textContent = '5';
      if(shapeSidesControls) shapeSidesControls.classList.add('hidden');
      if(shapeSidesSlider) shapeSidesSlider.value = '6';
      if(shapeSidesValue) shapeSidesValue.textContent = '6';
      activeShapeForAddition = null;
    };

    const resetTextDialog = () => {
      if(dialogTitle) dialogTitle.textContent = 'Add Text';
      if(addTextBtn) addTextBtn.textContent = 'Add';
      
      // Reset standard text fields
      if(textInput) textInput.value = '';
      if(textFontSizeInput) textFontSizeInput.value = '24';
      if(textFontFamilySelect) textFontFamilySelect.value = 'Inter';
      if(textColorPicker) textColorPicker.value = '#000000';
      if(colorPreviewText) colorPreviewText.style.backgroundColor = '#000000';
      selectedColorText = '#000000';
      boldBtn.classList.remove('active');
      italicBtn.classList.remove('active');
      underlineBtn.classList.remove('active');
      strikethroughBtn?.classList.remove('active');
      dropShadowBtn?.classList.remove('active');
      if(shadowControls) shadowControls.classList.add('hidden');
      glowBtn?.classList.remove('active');
      if(glowControls) glowControls.classList.add('hidden');
      if(glowColorPicker) glowColorPicker.value = '#0000ff';
      if(colorPreviewGlow) colorPreviewGlow.style.backgroundColor = '#0000ff';
      selectedColorGlow = '#0000ff';

      // Reset advanced text fields
      if(letterSpacingSlider) letterSpacingSlider.value = '0';
      if(lineHeightSlider) lineHeightSlider.value = '1';
      document.querySelectorAll('#text-align-container button').forEach(btn => {
        btn.classList.remove('active');
      });
      // Set 'left' as default active alignment
      document.querySelector('#text-align-container button[data-align="left"]')?.classList.add('active');

      // Reset circular/curvature text fields
      if(circularTextRadius) circularTextRadius.value = '150';
      if(circularTextCurvature) circularTextCurvature.value = '0';
    };

    // --- 4. Core Button Listeners (Dialog Control) ---
    addItemBtn?.addEventListener('click', () => {
        addItemDialog.style.display = 'flex';
    });

    cancelAddItemBtn?.addEventListener('click', () => {
        addItemDialog.style.display = 'none';
    });
    
    // --- 5. Konva Initialization ---
    if (typeof window.Konva === 'undefined') {
      console.error('Konva library is not loaded. Canvas features are disabled.');
      return;
    }

    const addFrame = (type: string) => {
        const frameWidth = Number(frameWidthSlider.value);
        const color = selectedColorFrame;
        const size = 150;

        const group = new window.Konva.Group({
            x: stage.width() / 4,
            y: stage.height() / 4,
            draggable: true,
            name: 'frame',
            'data-type': type,
        });

        let clipShape;
        switch(type) {
            case 'circle':
                clipShape = new window.Konva.Circle({ x: size/2, y: size/2, radius: size/2 });
                break;
            case 'star':
                clipShape = new window.Konva.Star({ x: size/2, y: size/2, numPoints: 5, innerRadius: size / 4, outerRadius: size / 2});
                break;
            default:
                clipShape = new window.Konva.Rect({ x: 0, y: 0, width: size, height: size });
                break;
        }
        
        group.clipFunc((ctx: any) => {
            // Use a clone for drawing to avoid transform issues
            const clipShapeForCtx = clipShape.clone(); 
            clipShapeForCtx.drawScene(ctx);
        });

        const borderShape = clipShape.clone();
        borderShape.setAttrs({
            name: 'frame-shape',
            fillEnabled: false,
            stroke: color,
            strokeWidth: frameWidth,
        });

        group.add(borderShape);

        window.Konva.Image.fromURL('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23cccccc%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20width%3D%2218%22%20height%3D%2218%22%20x%3D%223%22%20y%3D%223%22%20rx%3D%222%22%20ry%3D%222%22%2F%3E%3Ccircle%20cx%3D%229%22%20cy%3D%229%22%20r%3D%222%22%2F%3E%3Cpath%20d%3D%22m21%2015-3.086-3.086a2%202%200%200%200-2.828%200L6%2021%22%2F%3E%3C%2Fsvg%3E', (placeholder: any) => {
            placeholder.setAttrs({
                name: 'frame-placeholder',
                x: (size - 64) / 2,
                y: (size - 64) / 2,
                width: 64,
                height: 64,
            });
            group.add(placeholder);
            placeholder.moveToBottom();
            layer.draw();
        });
        
        layer.add(group);
        updateLayersPanel();
        layer.draw();
        selectNode(group);
        frameDialog.style.display = 'none';
    };


    addItemOptions?.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('[data-item-type]');
        if (!target) return;

        const itemType = target.getAttribute('data-item-type');
        addItemDialog.style.display = 'none'; // Close the main add dialog

        deselectNode(); // Deselect any active object
        if (itemType === 'text') {
            resetTextDialog();
            textDialog.style.display = 'flex';
        } else if (itemType === 'shape') {
            resetShapeDialog();
            shapeDialog.style.display = 'flex';
        } else if (itemType === 'image') {
            imageDialog.style.display = 'flex';
        } else if (itemType === 'frame') {
            frameDialog.style.display = 'flex';
        }
    });

    cancelShapeBtn?.addEventListener('click', () => { shapeDialog.style.display = 'none'; });
    cancelTextBtn?.addEventListener('click', () => { textDialog.style.display = 'none'; });
    cancelImageBtn?.addEventListener('click', () => { 
        imageDialog.style.display = 'none';
        if (imageFileInput) imageFileInput.value = ''; // Reset file input
    });
    cancelFrameBtn?.addEventListener('click', () => { frameDialog.style.display = 'none'; });
    
    frameButtonsContainer?.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('[data-frame-shape]');
        if (target) {
            const shapeType = target.getAttribute('data-frame-shape');
            if (shapeType) addFrame(shapeType);
        }
    });



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
      updateLayersPanel(); // Initial layers update
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

      const updateSelectedTextStyle = () => {
        if (!selectedNode || (selectedNode.name() !== 'text' && selectedNode.name() !== 'circularText')) return;

        if (selectedNode.name() === 'circularText') {
             // For circular text, we can't apply bold/italic/underline in the same way.
             // This could be enhanced in the future to recreate the text nodes.
            return;
        }

        const isBold = boldBtn.classList.contains('active');
        const isItalic = italicBtn.classList.contains('active');
        const isUnderline = underlineBtn.classList.contains('active');
        const isStrikethrough = strikethroughBtn.classList.contains('active');
        
        let decorations = [];
        if (isUnderline) decorations.push('underline');
        if (isStrikethrough) decorations.push('line-through');

        selectedNode.fontStyle(`${isBold ? 'bold ' : ''}${isItalic ? 'italic' : ''}`.trim());
        selectedNode.textDecoration(decorations.join(' '));
        
        // Advanced properties
        selectedNode.letterSpacing(Number(letterSpacingSlider.value));
        selectedNode.lineHeight(Number(lineHeightSlider.value));
        const activeAlignButton = document.querySelector('#text-align-container button.active');
        selectedNode.align(activeAlignButton?.getAttribute('data-align') || 'left');


        const isShadowActive = dropShadowBtn?.classList.contains('active');
        if (isShadowActive) {
          selectedNode.shadowEnabled(true);
          selectedNode.shadowColor('#000000');
          selectedNode.shadowBlur(Number(shadowBlurSlider.value));
          selectedNode.shadowOffset({ x: Number(shadowDistanceSlider.value), y: Number(shadowDistanceSlider.value) });
          selectedNode.shadowOpacity(Number(shadowOpacitySlider.value));
        } else {
            // Only disable shadow if glow is also disabled
            if (!glowBtn?.classList.contains('active')) {
                selectedNode.shadowEnabled(false);
            }
        }
        
        const isGlowActive = glowBtn?.classList.contains('active');
        if (isGlowActive) {
            selectedNode.shadowEnabled(true);
            selectedNode.shadowColor(selectedColorGlow); // Glow color is from its own picker
            selectedNode.shadowBlur(Number(glowBlurSlider.value));
            selectedNode.shadowOffset({ x: 0, y: 0 }); // No offset for glow
            selectedNode.shadowOpacity(Number(glowOpacitySlider.value));
        } else {
            // Only disable shadow if shadow is also disabled
            if (!dropShadowBtn?.classList.contains('active')) {
                selectedNode.shadowEnabled(false);
            }
        }

        layer.draw();
      };


      const addText = () => {
        const textValue = textInput.value || 'New Text';
        const fontSize = Number(textFontSizeInput.value);
        const fontFamily = textFontFamilySelect.value;
        const color = textColorPicker.value;
        
        // Advanced text properties
        const letterSpacing = Number(letterSpacingSlider.value);
        const lineHeight = Number(lineHeightSlider.value);
        const activeAlignButton = document.querySelector('#text-align-container button.active');
        const align = activeAlignButton?.getAttribute('data-align') || 'left';


        const newText = new window.Konva.Text({
          text: textValue,
          x: stage.width() / 4,
          y: stage.height() / 4,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fill: color,
          draggable: true,
          name: 'text',
          letterSpacing: letterSpacing,
          lineHeight: lineHeight,
          align: align,
        });
        
        // Apply styles
        const isBold = boldBtn.classList.contains('active');
        const isItalic = italicBtn.classList.contains('active');
        const isUnderline = underlineBtn.classList.contains('active');
        const isStrikethrough = strikethroughBtn.classList.contains('active');
        
        let decorations = [];
        if (isUnderline) decorations.push('underline');
        if (isStrikethrough) decorations.push('line-through');

        newText.fontStyle(`${isBold ? 'bold ' : ''}${isItalic ? 'italic' : ''}`.trim());
        newText.textDecoration(decorations.join(' '));
        
        newText.shadowEnabled(false);
        const isShadowActive = dropShadowBtn?.classList.contains('active');
        if (isShadowActive) {
          newText.shadowEnabled(true);
          newText.shadowColor('#000000');
          newText.shadowBlur(Number(shadowBlurSlider.value));
          newText.shadowOffset({ x: Number(shadowDistanceSlider.value), y: Number(shadowDistanceSlider.value) });
          newText.shadowOpacity(Number(shadowOpacitySlider.value));
        }

        const isGlowActive = glowBtn?.classList.contains('active');
        if (isGlowActive) {
            newText.shadowEnabled(true);
            newText.shadowColor(selectedColorGlow);
            newText.shadowBlur(Number(glowBlurSlider.value));
            newText.shadowOffset({ x: 0, y: 0 });
            newText.shadowOpacity(Number(glowOpacitySlider.value));
        }

        layer.add(newText);
        updateLayersPanel();
        layer.draw();
      };

      const addCircularText = () => {
        const textValue = textInput.value.trim() || 'Curved Text';
        const radius = Number(circularTextRadius.value);
        const curvatureValue = Number(circularTextCurvature.value);
        const color = textColorPicker.value;
        const fontFamily = textFontFamilySelect.value;

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
          'data-curvature': curvatureValue,
          'data-text': textValue,
          'data-radius': radius,
          'data-color': color,
          'data-font-family': fontFamily,
        });

        const tempText = new window.Konva.Text({ text: textValue, fontSize: fontSize, fontFamily: fontFamily });
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

          // Apply kerning for straight text
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
            fontFamily: fontFamily,
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
        updateLayersPanel();
        layer.draw();
      };
      
      const handleAddOrUpdateText = () => {
        const curvature = Number(circularTextCurvature.value);
        
        // If we are updating a node, we need to handle replacing it.
        if (selectedNode) {
            selectedNode.destroy(); // Remove the old node
            deselectNode();
        }

        if (curvature > 0) {
            addCircularText();
        } else {
            addText();
        }
        textDialog.style.display = 'none';
      };


      const addShape = (type: string, options: any = {}) => {
        let newShape;
        const x = stage.width() / 4;
        const y = stage.height() / 4;
        const size = 100;
        const color = selectedColorShape;
        const thickness = Number(shapeThicknessSlider.value);


        switch (type) {
          case 'rect':
            newShape = new window.Konva.Rect({ x, y, width: size, height: size, fill: color, draggable: true, name: 'shape', 'data-type': type });
            break;
          case 'circle':
            newShape = new window.Konva.Circle({ x, y, radius: size / 2, fill: color, draggable: true, name: 'shape', 'data-type': type });
            break;
          case 'triangle':
            newShape = new window.Konva.RegularPolygon({ x, y, sides: 3, radius: size / 2, fill: color, draggable: true, name: 'shape', 'data-type': type });
            break;
          case 'line':
            newShape = new window.Konva.Line({ points: [x, y, x + size, y], stroke: color, strokeWidth: thickness, draggable: true, name: 'shape', 'data-type': type });
            break;
          case 'star':
            newShape = new window.Konva.Star({ x, y, numPoints: 5, innerRadius: 20, outerRadius: 40, fill: color, draggable: true, name: 'shape', 'data-type': type });
            break;
          case 'pentagon':
            newShape = new window.Konva.RegularPolygon({ x, y, sides: 5, radius: size / 2, fill: color, draggable: true, name: 'shape', 'data-type': type });
            break;
          case 'polygon':
            newShape = new window.Konva.RegularPolygon({ x, y, sides: options.sides || 6, radius: size/2, fill: color, draggable: true, name: 'shape', 'data-type': type });
            break;
          case 'arrow':
            newShape = new window.Konva.Arrow({ x, y, points: [0, 0, size, 0], pointerLength: 10, pointerWidth: 10, fill: color, stroke: color, strokeWidth: thickness, draggable: true, name: 'shape', 'data-type': type });
            break;
        }
        if(newShape) layer.add(newShape);
        updateLayersPanel();
        layer.draw();
      };
      
      const addImageFromSource = (src: string) => {
        window.Konva.Image.fromURL(src, (imageNode: any) => {
            imageNode.setAttrs({
                x: stage.width() / 4,
                y: stage.height() / 4,
                draggable: true,
                name: 'image'
            });

            // Scale image to fit if it's too large
            const maxWidth = stage.width() * 0.5;
            const maxHeight = stage.height() * 0.5;
            const ratio = Math.min(maxWidth / imageNode.width(), maxHeight / imageNode.height());
            if (ratio < 1) {
                imageNode.width(imageNode.width() * ratio);
                imageNode.height(imageNode.height() * ratio);
            }

            layer.add(imageNode);
            updateLayersPanel();
            layer.draw();
        });
      };
      
      const applyFilter = (filter: any) => {
          if (!selectedNode || !selectedNode.hasName('image')) return;
          selectedNode.cache(); // Cache is required for filters
          selectedNode.filters(filter ? [filter] : []);
          layer.draw();
      };


      // --- 7. Konva Dependent Event Handlers ---

      // Initial resize
      resizeCanvas(canvasSizeSelect.value); 
      // Attach listeners
      window.addEventListener('resize', () => { resizeCanvas(currentCanvasSize); });
      canvasSizeSelect.addEventListener('change', e => resizeCanvas((e.target as HTMLSelectElement).value));
      

      // Color Picker Logic (Update state variables and visible swatch)
      textColorPicker?.addEventListener('input', e => {
        selectedColorText = (e.target as HTMLInputElement).value;
        if(colorPreviewText) colorPreviewText.style.backgroundColor = selectedColorText;
        if(selectedNode) {
          selectedNode.fill(selectedColorText);
          layer.draw();
        }
      });
      
      glowColorPicker?.addEventListener('input', e => {
          selectedColorGlow = (e.target as HTMLInputElement).value;
          if (colorPreviewGlow) colorPreviewGlow.style.backgroundColor = selectedColorGlow;
          if (selectedNode && glowBtn?.classList.contains('active')) {
              selectedNode.shadowColor(selectedColorGlow);
              layer.draw();
          }
      });
      
      shapeColorPicker?.addEventListener('input', e => {
        selectedColorShape = (e.target as HTMLInputElement).value;
        if(colorPreviewShape) colorPreviewShape.style.backgroundColor = selectedColorShape;
        
        // If we're editing a shape, update its color live
        if (selectedNode && selectedNode.hasName('shape')) {
            const shapeType = selectedNode.getAttr('data-type');
            if (shapeType === 'line' || shapeType === 'arrow') {
                selectedNode.stroke(selectedColorShape);
            } else {
                selectedNode.fill(selectedColorShape);
            }
            if (shapeType === 'arrow') {
                selectedNode.fill(selectedColorShape);
            }
            layer.draw();
        }
      });
      
      backgroundColorPicker?.addEventListener('input', e => {
        selectedColorBackground = (e.target as HTMLInputElement).value;
        if(colorPreviewBackground) colorPreviewBackground.style.backgroundColor = selectedColorBackground;
        if(canvasBackground) {
            canvasBackground.fill(selectedColorBackground);
            layer.draw();
        }
      });
      
      frameColorPicker?.addEventListener('input', e => {
          selectedColorFrame = (e.target as HTMLInputElement).value;
          if (colorPreviewFrame) colorPreviewFrame.style.backgroundColor = selectedColorFrame;
          if (selectedNode && selectedNode.hasName('frame')) {
              const border = selectedNode.findOne('.frame-shape');
              if (border) {
                  border.stroke(selectedColorFrame);
                  layer.draw();
              }
          }
      });

      frameWidthSlider?.addEventListener('input', e => {
          const newWidth = Number((e.target as HTMLInputElement).value);
          if(frameWidthValue) frameWidthValue.textContent = String(newWidth);
          if (selectedNode && selectedNode.hasName('frame')) {
              const border = selectedNode.findOne('.frame-shape');
              if (border) {
                  border.strokeWidth(newWidth);
                  layer.draw();
              }
          }
      });


      // Unified Text Dialog Add/Update
      addTextBtn?.addEventListener('click', handleAddOrUpdateText);


      // Shape Dialog Selection
      shapeDialog?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const shapeType = target.closest('[data-shape]')?.getAttribute('data-shape');
        if (shapeType) {
          if (shapeType === 'polygon') {
            activeShapeForAddition = 'polygon';
            if (shapeButtonsContainer) shapeButtonsContainer.classList.add('hidden');
            if (shapeSidesControls) shapeSidesControls.classList.remove('hidden');
            if (addShapeBtn) addShapeBtn.classList.remove('hidden');
          } else if (shapeType === 'line' || shapeType === 'arrow') {
            activeShapeForAddition = shapeType;
            if (shapeButtonsContainer) shapeButtonsContainer.classList.add('hidden');
            if (shapeThicknessControls) shapeThicknessControls.classList.remove('hidden');
            if (addShapeBtn) addShapeBtn.classList.remove('hidden');
          } else {
            addShape(shapeType);
            shapeDialog.style.display = 'none';
          }
        }
      });
      
      addShapeBtn?.addEventListener('click', () => {
        if(activeShapeForAddition) {
          let options = {};
          if(activeShapeForAddition === 'polygon') {
            options = { sides: Number(shapeSidesSlider.value) };
          }
          addShape(activeShapeForAddition, options);
          shapeDialog.style.display = 'none';
        }
      });

      shapeThicknessSlider?.addEventListener('input', (e) => {
        const newThickness = Number((e.target as HTMLInputElement).value);
        if(shapeThicknessValue) shapeThicknessValue.textContent = String(newThickness);
        if (selectedNode && selectedNode.hasName('shape')) {
            const shapeType = selectedNode.getAttr('data-type');
            if (shapeType === 'line' || shapeType === 'arrow') {
                selectedNode.strokeWidth(newThickness);
                layer.draw();
            }
        }
      });
      
      shapeSidesSlider?.addEventListener('input', (e) => {
        const newSides = Number((e.target as HTMLInputElement).value);
        if(shapeSidesValue) shapeSidesValue.textContent = String(newSides);
        if (selectedNode && selectedNode.getAttr('data-type') === 'polygon') {
            selectedNode.sides(newSides);
            layer.draw();
        }
      });
      
      // Image Dialog Add
      addImageBtn?.addEventListener('click', () => {
          if (imageFileInput?.files && imageFileInput.files.length > 0) {
              const file = imageFileInput.files[0];
              const reader = new FileReader();
              reader.onload = () => {
                  addImageFromSource(reader.result as string);
                  imageDialog.style.display = 'none';
                  if (imageFileInput) imageFileInput.value = ''; // Reset file input
              };
              reader.readAsDataURL(file);
          }
      });


      // Text Format Handlers
      boldBtn?.addEventListener('click', () => { boldBtn.classList.toggle('active'); updateSelectedTextStyle(); });
      italicBtn?.addEventListener('click', () => { italicBtn.classList.toggle('active'); updateSelectedTextStyle(); });
      underlineBtn?.addEventListener('click', () => { 
        underlineBtn.classList.toggle('active'); 
        if(underlineBtn.classList.contains('active') && strikethroughBtn) strikethroughBtn.classList.remove('active');
        updateSelectedTextStyle(); 
      });
      strikethroughBtn?.addEventListener('click', () => { 
        strikethroughBtn.classList.toggle('active');
        if(strikethroughBtn.classList.contains('active')) underlineBtn.classList.remove('active');
        updateSelectedTextStyle(); 
      });
      
      // Advanced Text Handlers
      letterSpacingSlider?.addEventListener('input', updateSelectedTextStyle);
      lineHeightSlider?.addEventListener('input', updateSelectedTextStyle);
      textAlignContainer?.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const button = target.closest('button');
          if (!button) return;

          // Remove active class from all buttons and add to the clicked one
          if(textAlignContainer) textAlignContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          updateSelectedTextStyle();
      });


      // Shadow Controls
      dropShadowBtn?.addEventListener('click', () => {
        dropShadowBtn.classList.toggle('active');
        if (dropShadowBtn.classList.contains('active')) {
          glowBtn.classList.remove('active');
          if(glowControls) glowControls.classList.add('hidden');
        }
        if(shadowControls) shadowControls.classList.toggle('hidden', !dropShadowBtn.classList.contains('active'));
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

      // Glow Controls
      glowBtn?.addEventListener('click', () => {
        glowBtn.classList.toggle('active');
        if (glowBtn.classList.contains('active')) {
          dropShadowBtn.classList.remove('active');
          if(shadowControls) shadowControls.classList.add('hidden');
        }
        if(glowControls) glowControls.classList.toggle('hidden', !glowBtn.classList.contains('active'));
        updateSelectedTextStyle();
      });
      
      glowBlurSlider?.addEventListener('input', () => {
        if(glowBlurValue) glowBlurValue.textContent = glowBlurSlider.value;
        updateSelectedTextStyle();
      });
      glowOpacitySlider?.addEventListener('input', () => {
        if(glowOpacityValue) glowOpacityValue.textContent = glowOpacitySlider.value;
        updateSelectedTextStyle();
      });
        
      deleteBtn?.addEventListener('click', () => {
        if (selectedNode) {
          selectedNode.destroy();
          deselectNode();
          updateLayersPanel();
        }
      });

      // --- Object Properties Panel Handlers ---
      const alignObject = (position: string) => {
        if (!selectedNode) return;
        const box = selectedNode.getClientRect({ relativeTo: stage });

        switch (position) {
            case 'top':
                selectedNode.y(selectedNode.y() - box.y);
                break;
            case 'left':
                selectedNode.x(selectedNode.x() - box.x);
                break;
            case 'center':
                selectedNode.x(stage.width() / 2);
                selectedNode.y(stage.height() / 2);
                break;
            case 'right':
                selectedNode.x(stage.width() - box.width - (selectedNode.x() - box.x));
                break;
            case 'bottom':
                selectedNode.y(stage.height() - box.height - (selectedNode.y() - box.y));
                break;
        }
        layer.draw();
      };
      
      alignTopBtn?.addEventListener('click', () => alignObject('top'));
      alignLeftBtn?.addEventListener('click', () => alignObject('left'));
      alignCenterBtn?.addEventListener('click', () => alignObject('center'));
      alignRightBtn?.addEventListener('click', () => alignObject('right'));
      alignBottomBtn?.addEventListener('click', () => alignObject('bottom'));

      opacitySlider?.addEventListener('input', (e) => {
        if (!selectedNode) return;
        const newOpacity = parseFloat((e.target as HTMLInputElement).value);
        selectedNode.opacity(newOpacity);
        layer.draw();
      });

      // Image Filter Handlers
      imageFiltersPanel?.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const button = target.closest('.filter-btn');
          if (!button) return;

          // Remove active class from all filter buttons
          imageFiltersPanel.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));

          const filterType = button.getAttribute('data-filter');
          if (filterType === 'none') {
              applyFilter(null);
          } else {
              button.classList.add('active');
              switch (filterType) {
                  case 'grayscale':
                      applyFilter(window.Konva.Filters.Grayscale);
                      break;
                  case 'sepia':
                      applyFilter(window.Konva.Filters.Sepia);
                      break;
                  case 'invert':
                      applyFilter(window.Konva.Filters.Invert);
                      break;
              }
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

        let nodeToSelect = e.target;

        // Special handling for frames
        if (e.target.getParent()?.hasName('frame')) {
            nodeToSelect = e.target.getParent();
        }
        // If a character in a circular group is clicked, select the parent group
        else if (e.target.parent?.hasName('circularText')) {
          nodeToSelect = e.target.parent;
        }

        selectNode(nodeToSelect);
      });
      
      // Update layers panel after drag ends.
      stage.on('dragend', () => {
        updateLayersPanel();
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
            <div className="editor-main-column">
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
                        <div className="color-picker-container-inline">
                            <label htmlFor="background-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Background Color</label>
                            <div id="color-preview-background" className="color-preview-circle" style={{backgroundColor: '#ffffff'}}></div>
                            <input type="color" id="background-color-picker" defaultValue="#ffffff" className="color-picker-input-hidden" />
                        </div>
                    </div>
                     {/* Object Properties Panel */}
                    <div id="object-properties" className="hidden">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Object Properties</h4>
                        <div className="alignment-controls">
                            <button id="align-top-btn" className="align-btn" title="Align Top">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="3"></line><line x1="5" y1="5" x2="19" y2="5"></line><rect x="5" y="9" width="14" height="10" rx="2"></rect></svg>
                            </button>
                            <button id="align-left-btn" className="align-btn" title="Align Left">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="3" y2="12"></line><line x1="5" y1="5" x2="5" y2="19"></line><rect y="5" x="9" width="10" height="14" rx="2"></rect></svg>
                            </button>
                            <button id="align-center-btn" className="align-btn" title="Center on Canvas">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="12" y2="12"/><line x1="12" x2="12" y1="3" y2="21"/></svg>
                            </button>
                            <button id="align-right-btn" className="align-btn" title="Align Right">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="21" y2="12"></line><line x1="19" y1="5" x2="19" y2="19"></line><rect y="5" x="5" width="10" height="14" rx="2"></rect></svg>
                            </button>
                             <button id="align-bottom-btn" className="align-btn" title="Align Bottom">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="21"></line><line x1="5" y1="19" x2="19" y2="19"></line><rect x="5" y="5" width="14" height="10" rx="2"></rect></svg>
                            </button>
                        </div>
                        <div className="opacity-controls">
                            <label htmlFor="opacity-slider">Opacity</label>
                            <input type="range" id="opacity-slider" min="0" max="1" step="0.05" defaultValue="1" />
                        </div>
                         {/* Image Filters Panel */}
                        <div id="image-filters-panel" className="hidden">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 mt-4">Image Filters</h4>
                            <div className="filter-buttons-container">
                                <button className="filter-btn" data-filter="grayscale">Grayscale</button>
                                <button className="filter-btn" data-filter="sepia">Sepia</button>
                                <button className="filter-btn" data-filter="invert">Invert</button>
                                <button className="filter-btn" data-filter="none">Reset</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                        <button id="add-item-btn" className="button button-primary flex-grow">Add Item</button>
                        <button id="delete-btn" className="button button-danger flex-grow hidden">Delete</button>
                        <button id="save-btn" className="button button-primary flex-grow">Save as Image</button>
                    </div>
                </div>
            </div>

            <div id="layers-panel">
                <h3 className="text-lg font-semibold mb-4 text-center">Layers</h3>
                <ul id="layers-list">
                    {/* Layer items will be dynamically inserted here */}
                </ul>
            </div>
        </div>

        {/* Unified Text Dialog */}
        <div id="text-dialog" className="dialog-overlay">
            <div className="dialog">
                <div className="dialog-content">
                    <h3 id="dialog-title" className="text-lg font-semibold mb-4">Add Text</h3>
                    
                    <div id="text-content" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                        <input type="text" id="text-input" className="dialog-input p-2 border rounded-md w-full mb-4" placeholder="Enter your text..." />
                        <div id="text-controls" className="mt-4 pt-4 relative">
                           <div className="color-picker-container-inline">
                                <label htmlFor="text-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Text Color</label>
                                <div id="color-preview-text" className="color-preview-circle" style={{backgroundColor: '#000000'}}></div>
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
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                    <option value="Arial Black">Arial Black</option>
                                    <option value="Garamond">Garamond</option>
                                </select>
                            </div>
                             <div className="mb-4 flex items-center justify-between">
                                <label htmlFor="circular-text-radius" className="block text-sm font-medium text-gray-700">Radius</label>
                                <input type="range" id="circular-text-radius" min="10" max="250" defaultValue="150" className="flex-grow ml-4" />
                            </div>
                            <div className="mb-4 flex flex-col items-start w-full">
                                <label htmlFor="circular-text-curvature" className="block text-sm font-medium text-gray-700 mb-2">Curvature</label>
                                <input type="range" id="circular-text-curvature" min="0" max="100" defaultValue="0" className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer" />
                                <div className="flex justify-between w-full text-xs text-gray-500 mt-1">
                                    <span className="text-gray-600 font-semibold">Straight (0)</span>
                                    <span className="text-gray-600 font-semibold">Full Wrap (100)</span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Font Style</label>
                                <div className="flex gap-2 justify-center">
                                    <button id="bold-btn" className="p-2 border rounded-md font-bold">B</button>
                                    <button id="italic-btn" className="p-2 border rounded-md italic">I</button>
                                    <button id="underline-btn" className="p-2 border rounded-md underline">U</button>
                                    <button id="strikethrough-btn" className="p-2 border rounded-md line-through">S</button>
                                    <button id="drop-shadow-btn" className="p-2 border rounded-md shadow-sm">Shadow</button>
                                    <button id="glow-btn" className="p-2 border rounded-md shadow-sm">Glow</button>
                                </div>
                            </div>
                            <div id="advanced-text-controls" className="flex flex-col gap-4 mt-4">
                                <div>
                                    <label htmlFor="letter-spacing-slider" className="block text-sm font-medium text-gray-700">Letter Spacing</label>
                                    <input type="range" id="letter-spacing-slider" min="-10" max="20" step="1" defaultValue="0" className="w-full" />
                                </div>
                                <div>
                                    <label htmlFor="line-height-slider" className="block text-sm font-medium text-gray-700">Line Height</label>
                                    <input type="range" id="line-height-slider" min="0.5" max="3" step="0.1" defaultValue="1" className="w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Alignment</label>
                                    <div id="text-align-container" className="flex gap-2 justify-center mt-1">
                                        <button data-align="left" className="p-2 border rounded-md active" title="Align Left">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                                        </button>
                                        <button data-align="center" className="p-2 border rounded-md" title="Align Center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="17" y1="6" x2="7" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="7" y2="18"></line></svg>
                                        </button>
                                        <button data-align="right" className="p-2 border rounded-md" title="Align Right">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="7" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
                                        </button>
                                    </div>
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
                             <div id="glow-controls" className="flex flex-col gap-4 mt-4 hidden">
                                <div className="color-picker-container-inline">
                                    <label htmlFor="glow-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Glow Color</label>
                                    <div id="color-preview-glow" className="color-preview-circle" style={{backgroundColor: '#0000ff'}}></div>
                                    <input type="color" id="glow-color-picker" defaultValue="#0000ff" className="color-picker-input-hidden" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Glow Blur (Current: <span id="glow-blur-value">10</span>)</label>
                                  <input type="range" id="glow-blur-slider" min="0" max="20" defaultValue="10" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Glow Opacity (Current: <span id="glow-opacity-value">0.7</span>)</label>
                                  <input type="range" id="glow-opacity-slider" min="0" max="1" step="0.1" defaultValue="0.7" />
                                </div>
                            </div>
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
                <h3 id="shape-dialog-title" className="text-lg font-semibold mb-4">Add a Shape</h3>
                 <div className="color-picker-container">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shape Color</label>
                    <div id="color-preview-shape" className="color-preview-circle" style={{backgroundColor: '#3b82f6'}}></div>
                    <input type="color" id="shape-color-picker" defaultValue="#3b82f6" className="color-picker-input-hidden" />
                </div>

                <div id="shape-thickness-controls" className="shape-slider-container hidden">
                    <label htmlFor="shape-thickness-slider" className="block text-sm font-medium text-gray-700">
                        Thickness (<span id="shape-thickness-value">5</span>px)
                    </label>
                    <input type="range" id="shape-thickness-slider" min="1" max="50" step="1" defaultValue="5" className="w-full" />
                </div>

                 <div id="shape-sides-controls" className="shape-slider-container hidden">
                    <label htmlFor="shape-sides-slider" className="block text-sm font-medium text-gray-700">
                        Sides (<span id="shape-sides-value">6</span>)
                    </label>
                    <input type="range" id="shape-sides-slider" min="3" max="12" step="1" defaultValue="6" className="w-full" />
                </div>

                <div id="shape-buttons-container" className="shape-button-container mt-4">
                    <button className="shape-btn" data-shape="rect" title="Rectangle">
                        <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                    </button>
                    <button className="shape-btn" data-shape="circle" title="Circle">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
    
                    </button>
                    <button className="shape-btn" data-shape="triangle" title="Triangle">
                        <svg viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2z"/></svg>
                    </button>
                    <button className="shape-btn" data-shape="line" title="Line">
                       <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M3 12h18"/></svg>
                    </button>
                    <button className="shape-btn" data-shape="star" title="Star">
                        <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </button>
                    <button className="shape-btn" data-shape="pentagon" title="Pentagon">
                        <svg viewBox="0 0 24 24"><path d="M12 2.5l9.51 6.91-3.63 11.09H6.12l-3.63-11.09L12 2.5z"/></svg>
                    </button>
                    <button className="shape-btn" data-shape="polygon" title="Polygon">
                        <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"><path d="M12 2.5l7.79 4.5 0 9 -7.79 4.5 -7.79 -4.5 0 -9Z"/></svg>
                    </button>
                    <button className="shape-btn" data-shape="arrow" title="Arrow">
                        <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                    </button>
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4">
                    <button id="cancel-shape-btn" className="dialog-button dialog-button-secondary">Cancel</button>
                    <button id="add-shape-btn" className="dialog-button dialog-button-primary hidden">Add Shape</button>
                </div>
            </div>
        </div>
        
        {/* Image Dialog */}
        <div id="image-dialog" className="dialog-overlay">
            <div className="dialog">
                <h3 className="text-lg font-semibold mb-4">Add an Image</h3>
                <div className="mb-4">
                    <label htmlFor="image-file-input" className="block text-sm font-medium text-gray-700 mb-2">Upload from computer</label>
                    <input type="file" id="image-file-input" className="w-full p-2 border rounded-md text-sm" accept="image/png, image/jpeg, image/gif, image/svg+xml" />
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4">
                    <button id="cancel-image-btn" className="dialog-button dialog-button-secondary">Cancel</button>
                    <button id="add-image-btn" className="dialog-button dialog-button-primary">Add Image</button>
                </div>
            </div>
        </div>

        {/* Add Item Dialog */}
        <div id="add-item-dialog" className="dialog-overlay">
            <div className="dialog">
                <h3 className="text-lg font-semibold mb-6">What would you like to add?</h3>
                <div id="add-item-options" className="grid grid-cols-2 gap-4">
                    <button className="add-item-card" data-item-type="text">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                        <span>Text</span>
                    </button>
                    <button className="add-item-card" data-item-type="shape">
                        <svg className="w-10 h-10 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        <span>Shape</span>
                    </button>
                     <button className="add-item-card" data-item-type="image">
                        <svg className="w-10 h-10 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        <span>Image</span>
                    </button>
                    <button className="add-item-card" data-item-type="frame">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                        <span>Frame</span>
                    </button>
                     <button className="add-item-card" data-item-type="qr" disabled>
                        <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/><path d="M12 21h-1a2 2 0 0 1-2-2v-1"/></svg>
                        <span>QR Code</span>
                    </button>
                </div>
                <div className="dialog-actions mt-6">
                    <button id="cancel-add-item-btn" className="dialog-button dialog-button-secondary">Cancel</button>
                </div>
            </div>
        </div>

        {/* Frame Dialog */}
        <div id="frame-dialog" className="dialog-overlay">
            <div className="dialog">
                <h3 className="text-lg font-semibold mb-4">Add a Frame</h3>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="color-picker-container-inline">
                        <label htmlFor="frame-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Color</label>
                        <div id="color-preview-frame" className="color-preview-circle" style={{backgroundColor: '#3b82f6'}}></div>
                        <input type="color" id="frame-color-picker" defaultValue="#3b82f6" className="color-picker-input-hidden" />
                    </div>
                    <div className="flex-grow">
                        <label htmlFor="frame-width-slider" className="block text-sm font-medium text-gray-700">
                            Width (<span id="frame-width-value">0</span>px)
                        </label>
                        <input type="range" id="frame-width-slider" min="0" max="50" step="1" defaultValue="0" className="w-full" />
                    </div>
                </div>
                <div id="frame-buttons-container" className="shape-button-container mt-4">
                    <button className="shape-btn" data-frame-shape="rect" title="Rectangle Frame">
                        <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                    </button>
                    <button className="shape-btn" data-frame-shape="circle" title="Circle Frame">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
_BODY_
                    </button>
                    <button className="shape-btn" data-frame-shape="star" title="Star Frame">
                        <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </button>
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4">
                    <button id="cancel-frame-btn" className="dialog-button dialog-button-secondary">Close</button>
                </div>
            </div>
        </div>
      </main>
    </>
  );
}

    

    