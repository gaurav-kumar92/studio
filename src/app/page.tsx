
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Canvas from '@/components/editor/Canvas';
import ShapeDialog from '@/components/editor/ShapeDialog';
import AddItemDialog from '@/components/editor/AddItemDialog';

// This is a global declaration for the Konva object.
// It's a way to tell TypeScript that 'Konva' will be available on the window object
// at runtime, even though we can't import it directly as a module.
declare global {
  interface Window {
    Konva: any;
  }
}


export default function KonvaEditor() {
  const canvasRef = useRef<{ stage: any; layer: any; background: any }>(null);
  const transformerRef = useRef<any>(null);
  const [konvaObjects, setKonvaObjects] = useState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState('842x1191');
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Dialog states
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isShapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [isTextDialogOpen, setTextDialogOpen] = useState(false);
  const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
  const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
  
  const [editingShapeNode, setEditingShapeNode] = useState<any>(null);


  useEffect(() => {
    if (canvasRef.current?.background && isCanvasReady) {
      canvasRef.current.background.fill(backgroundColor);
      canvasRef.current.layer.draw();
    }
  }, [backgroundColor, isCanvasReady]);

  // Handle transformer attachment
  useEffect(() => {
    if (!isCanvasReady) return;

    const stage = canvasRef.current.stage;
    const layer = canvasRef.current.layer;

    // Destroy previous transformer if it exists
    if (transformerRef.current) {
      transformerRef.current.destroy();
    }

    if (selectedNode) {
      const tr = new window.Konva.Transformer({
        nodes: [selectedNode],
        rotateEnabled: true,
      });
      layer.add(tr);
      transformerRef.current = tr;
    } 
    layer.batchDraw();

    const objectPropertiesPanel = document.getElementById('object-properties');
    const deleteBtn = document.getElementById('delete-btn');
    if (objectPropertiesPanel) objectPropertiesPanel.classList.toggle('hidden', !selectedNode);
    if (deleteBtn) deleteBtn.classList.toggle('hidden', !selectedNode);
    
    // Cleanup on unmount
    return () => {
      if (transformerRef.current) {
        transformerRef.current.destroy();
      }
    };
  }, [selectedNode, isCanvasReady]);

  const deselectNode = () => {
    setSelectedNode(null);
  }


  const initializeKonva = () => {
    // Check if Konva is loaded and if we're in a browser environment
    if (typeof window === 'undefined' || typeof window.Konva === 'undefined' || !canvasRef.current?.stage) {
        return;
    }

    const { stage, layer, background: canvasBackground } = canvasRef.current;


    // --- 1. Element References ---
    const layersPanel = document.getElementById('layers-panel') as HTMLElement;
    const layersList = document.getElementById('layers-list') as HTMLElement;
    
    // Dialogs and Controls
    const textDialog = document.getElementById('text-dialog') as HTMLElement;
    const frameDialog = document.getElementById('frame-dialog') as HTMLElement;
    const maskDialog = document.getElementById('mask-dialog') as HTMLElement;
    const controls = document.getElementById('controls');


    // Buttons
    const cancelTextBtn = document.getElementById('cancel-btn');
    const cancelFrameBtn = document.getElementById('cancel-frame-btn');
    const addFrameBtn = document.getElementById('add-frame-btn');
    const cancelMaskBtn = document.getElementById('cancel-mask-btn');
    const addMaskBtn = document.getElementById('add-mask-btn');
    const addTextBtn = document.getElementById('add-btn');
    const deleteBtn = document.getElementById('delete-btn') as HTMLElement;
    const saveBtn = document.getElementById('save-btn');
    
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
    
    // Image Specific
    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";
    imageFileInput.style.display = 'none';
    document.body.appendChild(imageFileInput);


    // Frame Specific
    const frameButtonsContainer = document.getElementById('frame-buttons-container');
    const frameColorPicker = document.getElementById('frame-color-picker') as HTMLInputElement;
    const colorPreviewFrame = document.getElementById('color-preview-frame') as HTMLElement;
    const frameThicknessControls = document.getElementById('frame-thickness-controls') as HTMLElement;
    const frameThicknessSlider = document.getElementById('frame-thickness-slider') as HTMLInputElement;
    const frameThicknessValue = document.getElementById('frame-thickness-value');
    const frameSidesControls = document.getElementById('frame-sides-controls') as HTMLElement;
    const frameSidesSlider = document.getElementById('frame-sides-slider') as HTMLInputElement;
    const frameSidesValue = document.getElementById('frame-sides-value');

    // Mask Specific
    const maskButtonsContainer = document.getElementById('mask-buttons-container');
    const alphabetMasksContainer = document.getElementById('alphabet-masks-container');
    const maskColorPicker = document.getElementById('mask-color-picker') as HTMLInputElement;
    const colorPreviewMask = document.getElementById('color-preview-mask') as HTMLElement;
    const maskBorderThicknessControls = document.getElementById('mask-border-thickness-controls') as HTMLElement;
    const maskBorderThicknessSlider = document.getElementById('mask-border-thickness-slider') as HTMLInputElement;
    const maskBorderThicknessValue = document.getElementById('mask-border-thickness-value');
    const maskSidesControls = document.getElementById('mask-sides-controls') as HTMLElement;
    const maskSidesSlider = document.getElementById('mask-sides-slider') as HTMLInputElement;
    const maskSidesValue = document.getElementById('mask-sides-value');

    // Object Properties
    const alignTopBtn = document.getElementById('align-top-btn');
    const alignLeftBtn = document.getElementById('align-left-btn');
    const alignCenterBtn = document.getElementById('align-center-btn');
    const alignRightBtn = document.getElementById('align-right-btn');
    const alignBottomBtn = document.getElementById('align-bottom-btn');
    const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;

    // --- 2. Global State Variables ---
    let activeFrameForAddition: string | null = null;
    let activeMaskForAddition: string | null = null;
    
    // Initialize colors from pickers
    let selectedColorText = textColorPicker.value;
    let selectedColorFrame = frameColorPicker.value;
    let selectedColorMask = maskColorPicker.value;
    let selectedColorGlow = glowColorPicker.value;

    // --- 3. UI and Helper Functions (Declared after variables) ---
    // Function to update the layers panel based on the canvas state
    const updateLayersPanel = () => {
        if (!layersList || !layer) return;

        layersList.innerHTML = ''; // Clear current list
        const nodes = layer.getChildren((node: any) => {
            return node.name() !== 'background' && node.className !== 'Transformer';
        });

        setKonvaObjects(nodes);

        // Add layers in reverse order (top layer first)
        nodes.slice().reverse().forEach((node: any, index: number) => {
            let iconSvg = '';
            let name = 'Object';

            if (node.hasName('text') || node.hasName('circularText')) {
                iconSvg = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`;
                name = node.hasName('text') ? `Text: "${node.text().substring(0, 15)}..."` : `Curved Text`;
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


            const li = document.createElement('li');
            li.className = 'layer-item';
            if (selectedNode && selectedNode.id() === node.id()) {
                li.classList.add('selected');
            }
            li.setAttribute('data-id', node.id());

            const infoDiv = document.createElement('div');
            infoDiv.className = 'layer-info';
            infoDiv.innerHTML = iconSvg + `<span class="name">${name}</span>`;
            infoDiv.onclick = () => selectNode(node);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'layer-actions';

            const upBtn = document.createElement('button');
            upBtn.className = 'layer-action-btn';
            upBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5l6 6h-3v6h-6v-6H6z"/></svg>';
            upBtn.title = "Move Up";
            upBtn.disabled = index === 0;
            upBtn.onclick = (e) => { e.stopPropagation(); node.moveUp(); layer.draw(); updateLayersPanel(); };

            const downBtn = document.createElement('button');
            downBtn.className = 'layer-action-btn';
            downBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l-6-6h3V7h6v6h3z"/></svg>';
            downBtn.title = "Move Down";
            downBtn.disabled = index === nodes.length - 1;
            downBtn.onclick = (e) => { e.stopPropagation(); node.moveDown(); layer.draw(); updateLayersPanel(); };

            actionsDiv.appendChild(upBtn);
            actionsDiv.appendChild(downBtn);

            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
            layersList.appendChild(li);
        });
    };

    // Forward declare functions that are called by others before they are defined
    let selectNode: (node: any) => void;
    let resetFrameDialog: () => void;
    let resetMaskDialog: () => void;
    let addImageToMask: (maskGroup: any) => void;

    const addMask = (type: string, options: any = {}) => {
        if (!stage || !layer) return;
    
        const size = 150; 
    
        const group = new window.Konva.Group({
            x: stage.width() / 4,
            y: stage.height() / 4,
            width: size,
            height: size,
            draggable: true,
            name: 'mask',
            'data-type': type,
            ...options
        });
    
        let borderShape: any;
    
        const commonAttrs = {
            x: size / 2, 
            y: size / 2, 
            fill: '#f0f0f0', 
        };
    
        switch (type) {
            case 'circle':
                borderShape = new window.Konva.Circle({ ...commonAttrs, radius: size / 2 });
                break;
            case 'star':
                borderShape = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: size / 4, outerRadius: size / 2 });
                break;
            case 'triangle':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2 });
                break;
            case 'polygon':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: options.sides || 6, radius: size / 2 });
                break;
            case 'diamond':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / (Math.sqrt(2)) });
                break;
            case 'alphabet':
                borderShape = new window.Konva.Text({
                    x: 0,
                    y: 0,
                    text: options.letter || 'A',
                    fontSize: size,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold',
                    align: 'center',
                    verticalAlign: 'middle',
                    width: size,
                    height: size,
                    fill: '#f0f0f0',
                });
                break;
            default: // rect
                borderShape = new window.Konva.Rect({ x: 0, y: 0, width: size, height: size, fill: '#f0f0f0' });
                break;
        }
    
        group.add(borderShape);
    
        const placeholderSvgPath = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
        const placeholderIcon = new window.Konva.Path({
            data: placeholderSvgPath,
            fill: '#9ca3af',
            scale: { x: 2.5, y: 2.5 },
            name: 'placeholder-icon',
            offsetX: 12,
            offsetY: 12,
            x: size / 2,
            y: size / 2,
        });
        group.add(placeholderIcon);
    
        group.clipFunc(function (ctx: any) {
             const shape = borderShape;
             ctx.beginPath();
             shape.sceneFunc().call(shape, ctx, shape);
             ctx.closePath();
        });
    
        layer.add(group);
        updateLayersPanel();
        layer.draw();
        selectNode(group);
        setMaskDialogOpen(false);
        resetMaskDialog();
    };


    addImageToMask = (maskGroup: any) => {
        if (!maskGroup || maskGroup.name() !== 'mask') return;

        imageFileInput.onchange = () => {
            if (imageFileInput.files && imageFileInput.files.length > 0) {
                const file = imageFileInput.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                        maskGroup.find('.placeholder-icon, .mask-image').forEach((child: any) => child.destroy());
                        
                        const maskWidth = maskGroup.width();
                        const maskHeight = maskGroup.height();
                        const imgWidth = img.width();
                        const imgHeight = img.height();
                        
                        const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);
                        const scaledWidth = imgWidth * scale;
                        const scaledHeight = imgHeight * scale;

                        img.setAttrs({
                            name: 'mask-image',
                            x: (maskWidth - scaledWidth) / 2,
                            y: (maskHeight - scaledHeight) / 2,
                            width: scaledWidth,
                            height: scaledHeight,
                        });

                        maskGroup.add(img);
                        img.moveToBottom(); 
                        
                        const borderShape = maskGroup.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text,Path');
                        if (borderShape) {
                             borderShape.fill(null);
                             borderShape.stroke(null);
                             borderShape.opacity(0);
                        }


                        layer.draw();
                        updateLayersPanel();
                    });
                };
                reader.readAsDataURL(file);
            }
            imageFileInput.value = '';
        };
        imageFileInput.click();
    };

    const addFrame = (type: string, options: any = {}) => {
        let newFrame;
        const x = stage.width() / 4;
        const y = stage.height() / 4;
        const size = 100;
        const color = selectedColorFrame;
        const thickness = Number(frameThicknessSlider.value);


        const commonAttrs = {
            x, y,
            stroke: color,
            strokeWidth: thickness,
            draggable: true,
            name: 'frame',
            'data-type': type
        };

        switch (type) {
          case 'rect':
            newFrame = new window.Konva.Rect({ ...commonAttrs, width: size, height: size });
            break;
          case 'circle':
            newFrame = new window.Konva.Circle({ ...commonAttrs, radius: size / 2 });
            break;
          case 'triangle':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2 });
            break;
          case 'star':
            newFrame = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: 20, outerRadius: 40 });
            break;
          case 'polygon':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: options.sides || 6, radius: size/2 });
            break;
          case 'diamond':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / Math.SQRT2 });
            break;
        }

        if(newFrame) {
            layer.add(newFrame);
            updateLayersPanel();
            layer.draw();
            selectNode(newFrame);
        }
        
        setFrameDialogOpen(false);
        resetFrameDialog();
    };
    

    selectNode = (node: any) => {
        if (!layer) return;
        // If it's a child of a group, select the group.
        let nodeToSelect = node;
        if (node.parent?.hasName('circularText') || node.parent?.hasName('mask')) {
          nodeToSelect = node.parent;
        }

        if (nodeToSelect === selectedNode) {
            return;
        }
        
        setSelectedNode(nodeToSelect);
        
        if(opacitySlider) opacitySlider.value = String(nodeToSelect.opacity());
        
        // Remove previous listeners to avoid duplicates
        nodeToSelect.off('dblclick dbltap');
        nodeToSelect.on('dblclick dbltap', () => {
             if (nodeToSelect.hasName('text') || nodeToSelect.hasName('circularText')) {
              setTextDialogOpen(true);
              if (dialogTitle) dialogTitle.textContent = 'Update Text';
              if (addTextBtn) addTextBtn.textContent = 'Update';

              if (nodeToSelect.hasName('text')) {
                  if(textInput) textInput.value = nodeToSelect.text();
                  if(textFontSizeInput) textFontSizeInput.value = nodeToSelect.fontSize();
                  if(textFontFamilySelect) textFontFamilySelect.value = nodeToSelect.fontFamily();
                  if(textColorPicker) textColorPicker.value = nodeToSelect.fill();
                  if(colorPreviewText) colorPreviewText.style.backgroundColor = nodeToSelect.fill();
                  
                  if(letterSpacingSlider) letterSpacingSlider.value = nodeToSelect.letterSpacing();
                  if(lineHeightSlider) lineHeightSlider.value = nodeToSelect.lineHeight();
                  document.querySelectorAll('#text-align-container button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-align') === nodeToSelect.align()) {
                        btn.classList.add('active');
                    }
                  });
                  
                  if(circularTextCurvature) circularTextCurvature.value = '0';
                  if(circularTextRadius) circularTextRadius.value = '150'; 

              } else if (nodeToSelect.hasName('circularText')) {
                  if(textInput) textInput.value = nodeToSelect.getAttr('data-text');
                  if(circularTextCurvature) circularTextCurvature.value = nodeToSelect.getAttr('data-curvature');
                  if(circularTextRadius) circularTextRadius.value = nodeToSelect.getAttr('data-radius');
                  if(textColorPicker) textColorPicker.value = nodeToSelect.getAttr('data-color');
                  if(colorPreviewText) colorPreviewText.style.backgroundColor = nodeToSelect.getAttr('data-color');
                  if(textFontFamilySelect) textFontFamilySelect.value = nodeToSelect.getAttr('data-font-family');
              }
            } else if (nodeToSelect.hasName('shape')) {
              setEditingShapeNode(nodeToSelect);
              setShapeDialogOpen(true);
            } else if (nodeToSelect.hasName('image')) {
                // This logic is for replacing an existing image.
                imageFileInput.onchange = () => {
                    if (imageFileInput.files && imageFileInput.files.length > 0) {
                        const file = imageFileInput.files[0];
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                                const MAX_WIDTH = stage.width() * 0.8;
                                const MAX_HEIGHT = stage.height() * 0.8;
                                const scale = Math.min(MAX_WIDTH / img.width(), MAX_HEIGHT / img.height(), 1);
                                
                                // Replace the old image with the new one
                                nodeToSelect.destroy();
                                
                                img.setAttrs({
                                    x: (stage.width() - img.width() * scale) / 2,
                                    y: (stage.height() - img.height() * scale) / 2,
                                    scaleX: scale,
                                    scaleY: scale,
                                    name: 'image',
                                    draggable: true,
                                });
                                layer.add(img);
                                selectNode(img); // Reselect the new image
                                updateLayersPanel();
                                layer.draw();
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                    imageFileInput.value = ''; // Reset input
                };
                imageFileInput.click();
            } else if (nodeToSelect.hasName('frame')) {
                setFrameDialogOpen(true);
                if(frameButtonsContainer) frameButtonsContainer.classList.add('hidden');
                if(addFrameBtn) addFrameBtn.classList.add('hidden');

                if(frameColorPicker) frameColorPicker.value = nodeToSelect.stroke();
                if(colorPreviewFrame) colorPreviewFrame.style.backgroundColor = nodeToSelect.stroke();
                
                const frameType = nodeToSelect.getAttr('data-type');
                if (frameType === 'polygon') {
                    if(frameSidesControls) frameSidesControls.classList.remove('hidden');
                    if(frameSidesSlider) frameSidesSlider.value = nodeToSelect.sides();
                    if(frameSidesValue) frameSidesValue.textContent = nodeToSelect.sides();
                } else {
                    if(frameSidesControls) frameSidesControls.classList.add('hidden');
                }
                
                if(frameThicknessSlider) frameThicknessSlider.value = nodeToSelect.strokeWidth();
                if(frameThicknessValue) frameThicknessValue.textContent = nodeToSelect.strokeWidth();
                
            } else if (nodeToSelect.hasName('mask')) {
                addImageToMask(nodeToSelect);
            }
        });

        updateLayersPanel();
    };

    resetMaskDialog = () => {
        if(maskButtonsContainer) maskButtonsContainer.classList.remove('hidden');
        if(alphabetMasksContainer) alphabetMasksContainer.classList.remove('hidden');
        if(addMaskBtn) addMaskBtn.classList.add('hidden');
        if(maskSidesControls) maskSidesControls.classList.add('hidden');
        
        activeMaskForAddition = null;
    };
    
    resetFrameDialog = () => {
        if(frameButtonsContainer) frameButtonsContainer.classList.remove('hidden');
        if(addFrameBtn) addFrameBtn.classList.add('hidden');
        if(frameSidesControls) frameSidesControls.classList.add('hidden');
        if(frameThicknessControls) frameThicknessControls.classList.remove('hidden');
        
        if(frameColorPicker) frameColorPicker.value = '#3b82f6';
        if(colorPreviewFrame) colorPreviewFrame.style.backgroundColor = '#3b82f6';
        selectedColorFrame = '#3b82f6';

        if(frameThicknessSlider) frameThicknessSlider.value = '10';
        if(frameThicknessValue) frameThicknessValue.textContent = '10';
        
        if(frameSidesSlider) frameSidesSlider.value = '6';
        if(frameSidesValue) frameSidesValue.textContent = '6';
        
        activeFrameForAddition = null;
    };

    const resetTextDialog = () => {
      if(dialogTitle) dialogTitle.textContent = 'Add Text';
      if(addTextBtn) addTextBtn.textContent = 'Add';
      
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

      if(letterSpacingSlider) letterSpacingSlider.value = '0';
      if(lineHeightSlider) lineHeightSlider.value = '1';
      document.querySelectorAll('#text-align-container button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector('#text-align-container button[data-align="left"]')?.classList.add('active');

      if(circularTextRadius) circularTextRadius.value = '150';
      if(circularTextCurvature) circularTextCurvature.value = '0';
    };


    // --- 4. Core Button Listeners (Dialog Control) ---
    
    // --- 5. Konva Initialization ---
    if (typeof window.Konva === 'undefined') {
      console.error('Konva library is not loaded. Canvas features are disabled.');
      return;
    }

    cancelTextBtn?.addEventListener('click', () => setTextDialogOpen(false));
    cancelFrameBtn?.addEventListener('click', () => { setFrameDialogOpen(false); resetFrameDialog(); });
    cancelMaskBtn?.addEventListener('click', () => { setMaskDialogOpen(false); resetMaskDialog(); });
    
    frameButtonsContainer?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const frameType = target.closest('[data-frame-shape]')?.getAttribute('data-frame-shape');
        if (frameType) {
            if (frameType === 'polygon') {
                activeFrameForAddition = frameType;
                if(frameButtonsContainer) frameButtonsContainer.classList.add('hidden');
                if(frameSidesControls) frameSidesControls.classList.remove('hidden');
                if(addFrameBtn) addFrameBtn.classList.remove('hidden');
            } else {
                addFrame(frameType);
            }
        }
    });

    maskButtonsContainer?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const maskType = target.closest('[data-mask-shape]')?.getAttribute('data-mask-shape');
        if (maskType) {
            if (maskType === 'polygon' || maskType === 'diamond') {
                activeMaskForAddition = maskType;
                if(maskButtonsContainer) maskButtonsContainer.classList.add('hidden');
                if(alphabetMasksContainer) alphabetMasksContainer.classList.add('hidden');
                if(maskSidesControls) maskSidesControls.classList.remove('hidden');
                if(addMaskBtn) addMaskBtn.classList.remove('hidden');
            } else {
                addMask(maskType);
            }
        }
    });

    alphabetMasksContainer?.addEventListener('click', e => {
        const target = e.target as HTMLElement;
        const letter = target.closest('[data-alphabet-mask]')?.getAttribute('data-alphabet-mask');
        if (letter) {
            addMask('alphabet', { letter: letter, 'data-letter': letter });
        }
    });
    
    addFrameBtn?.addEventListener('click', () => {
        if(activeFrameForAddition) {
            const options = { sides: Number(frameSidesSlider.value) };
            addFrame(activeFrameForAddition, options);
        }
    });

    addMaskBtn?.addEventListener('click', () => {
        if(activeMaskForAddition) {
            const options = { sides: Number(maskSidesSlider.value) };
            addMask(activeMaskForAddition, options);
        }
    });


    try {
      updateLayersPanel();

      // --- 6. Konva Dependent Functions ---
      const updateSelectedTextStyle = () => {
        if (!selectedNode || (selectedNode.name() !== 'text' && selectedNode.name() !== 'circularText')) return;

        if (selectedNode.name() === 'circularText') {
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
            if (!glowBtn?.classList.contains('active')) {
                selectedNode.shadowEnabled(false);
            }
        }
        
        const isGlowActive = glowBtn?.classList.contains('active');
        if (isGlowActive) {
            selectedNode.shadowEnabled(true);
            selectedNode.shadowColor(selectedColorGlow); 
            selectedNode.shadowBlur(Number(glowBlurSlider.value));
            selectedNode.shadowOffset({ x: 0, y: 0 }); 
            selectedNode.shadowOpacity(Number(glowOpacitySlider.value));
        } else {
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

        const fontSize = Math.max(10, Math.floor(radius / 5));

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


        const maxAngleRadians = 2 * Math.PI * (curvatureValue / 100);

        let totalFlatWidth = 0;
        for (const char of textValue) {
          tempText.text(char);
          totalFlatWidth += tempText.width();
        }

        const totalFlatAngle = totalFlatWidth / radius;

        const scaleFactor = (totalFlatAngle > 0 && maxAngleRadians > 0) ? maxAngleRadians / totalFlatAngle : 0;

        let cumulativeAngle = 0;
        let linearOffset = 0; 

        for (let i = 0; i < textValue.length; i++) {
          const char = textValue[i];
          tempText.text(char);
          let charWidth = tempText.width();

          const adjustedCharWidth = (curvatureValue < 1) ? charWidth * STRAIGHT_KERNING_FACTOR : charWidth;

          const charAngularWidth = charWidth / radius;

          const scaledAngularWidth = charAngularWidth * scaleFactor;
          const centerAngle = cumulativeAngle + (scaledAngularWidth / 2);

          let x, y, rotationDegrees, offsetX;

          if (curvatureValue < 1) { 
            x = linearOffset;
            y = 0;
            rotationDegrees = 0;
            offsetX = 0; 
            linearOffset += adjustedCharWidth; 

          } else {
            const placementAngle = centerAngle - (Math.PI / 2); 
            x = radius * Math.cos(placementAngle);
            y = radius * Math.sin(placementAngle);
            rotationDegrees = centerAngle * 180 / Math.PI;
            offsetX = charWidth / 2; 

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

        let finalFlatWidth = totalFlatWidth; 
        if (curvatureValue < 1) {
          finalFlatWidth = linearOffset;
          circularGroup.offsetX(finalFlatWidth / 2);
          circularGroup.rotation(0);
        } else {
          const totalArcWidth = cumulativeAngle;
          circularGroup.rotation(-totalArcWidth * 180 / (2 * Math.PI));
        }


        layer.add(circularGroup);
        updateLayersPanel();
        layer.draw();
      };
      
      const handleAddOrUpdateText = () => {
        const curvature = Number(circularTextCurvature.value);
        
        if (selectedNode) {
            if (selectedNode.hasName('text') || selectedNode.hasName('circularText')) {
                selectedNode.destroy(); 
                deselectNode();
            }
        }

        if (curvature > 0) {
            addCircularText();
        } else {
            addText();
        }
        setTextDialogOpen(false);
      };
      
      const applyFilter = (filter: any) => {
          let nodeToFilter = selectedNode;
          if (!nodeToFilter) return;

          if (nodeToFilter.hasName('mask')) {
            nodeToFilter = nodeToFilter.findOne('.mask-image');
          }

          if (!nodeToFilter || (nodeToFilter.name() !== 'image' && nodeToFilter.name() !== 'mask-image')) return;

          nodeToFilter.cache(); 
          nodeToFilter.filters(filter ? [filter] : []);
          layer.draw();
      };


      // --- 7. Konva Dependent Event Handlers ---
      const canvasSizeSelector = document.getElementById('canvas-size');
      canvasSizeSelector?.addEventListener('change', (e) => {
        const newSize = (e.target as HTMLSelectElement).value;
        setCanvasSize(newSize);
      });
      
      
      alignTopBtn?.addEventListener('click', () => alignObject('top'));
      alignLeftBtn?.addEventListener('click', () => alignObject('left'));
      alignCenterBtn?.addEventListener('click', () => alignObject('center'));
      alignRightBtn?.addEventListener('click', () => alignObject('right'));
      alignBottomBtn?.addEventListener('click', () => alignObject('bottom'));

      opacitySlider?.addEventListener('input', (e) => {
          if (selectedNode) {
              const opacity = parseFloat((e.target as HTMLInputElement).value);
              selectedNode.opacity(opacity);
              layer.draw();
          }
      });
      
      const alignObject = (position: string) => {
          if (!selectedNode) return;
          const box = selectedNode.getClientRect({ relativeTo: stage });

          switch(position) {
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


      textColorPicker?.addEventListener('input', e => {
        selectedColorText = (e.target as HTMLInputElement).value;
        if(colorPreviewText) colorPreviewText.style.backgroundColor = selectedColorText;
        if(selectedNode) {
          if (selectedNode.hasName('text')) {
             selectedNode.fill(selectedColorText);
             layer.draw();
          }
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
      
      frameColorPicker?.addEventListener('input', e => {
          selectedColorFrame = (e.target as HTMLInputElement).value;
          if (colorPreviewFrame) colorPreviewFrame.style.backgroundColor = selectedColorFrame;
          if (selectedNode && selectedNode.hasName('frame')) {
              selectedNode.stroke(selectedColorFrame);
              layer.draw();
          }
      });

      frameThicknessSlider?.addEventListener('input', e => {
          const newThickness = Number((e.target as HTMLInputElement).value);
          if(frameThicknessValue) frameThicknessValue.textContent = String(newThickness);
          if (selectedNode && selectedNode.hasName('frame')) {
              selectedNode.strokeWidth(newThickness);
              layer.draw();
          }
      });
      
      frameSidesSlider?.addEventListener('input', (e) => {
        const newSides = Number((e.target as HTMLInputElement).value);
        if(frameSidesValue) frameSidesValue.textContent = String(newSides);
        if (selectedNode && selectedNode.hasName('frame') && selectedNode.getAttr('data-type') === 'polygon') {
            selectedNode.sides(newSides);
            layer.draw();
        }
      });

      maskColorPicker?.addEventListener('input', e => {
          selectedColorMask = (e.target as HTMLInputElement).value;
          if (colorPreviewMask) colorPreviewMask.style.backgroundColor = selectedColorMask;
          if (selectedNode && selectedNode.hasName('mask')) {
              const border = selectedNode.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text');
              if (border) {
                border.stroke(selectedColorMask);
                layer.draw();
              }
          }
      });

      maskBorderThicknessSlider?.addEventListener('input', e => {
          const newThickness = Number((e.target as HTMLInputElement).value);
          if(maskBorderThicknessValue) maskBorderThicknessValue.textContent = String(newThickness);
          if (selectedNode && selectedNode.hasName('mask')) {
              const border = selectedNode.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text');
              if (border) {
                border.strokeWidth(newThickness);
                layer.draw();
              }
          }
      });
      
      maskSidesSlider?.addEventListener('input', (e) => {
        const newSides = Number((e.target as HTMLInputElement).value);
        if(maskSidesValue) maskSidesValue.textContent = String(newSides);
        if (selectedNode && selectedNode.hasName('mask') && (selectedNode.getAttr('data-type') === 'polygon' || selectedNode.getAttr('data-type') === 'diamond')) {
            const border = selectedNode.findOne('RegularPolygon');
             if (border) {
                border.sides(newSides);
                layer.draw();
            }
        }
      });


      addTextBtn?.addEventListener('click', handleAddOrUpdateText);


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
      
      letterSpacingSlider?.addEventListener('input', updateSelectedTextStyle);
      lineHeightSlider?.addEventListener('input', updateSelectedTextStyle);
      textAlignContainer?.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const button = target.closest('button');
          if (!button) return;

          if(textAlignContainer) textAlignContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          updateSelectedTextStyle();
      });


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

      stage.on('click tap', (e: any) => {
        if (e.target === stage || e.target === canvasBackground) {
          deselectNode();
          return;
        }

        selectNode(e.target);
      });
      
      stage.on('dragend', () => {
        updateLayersPanel();
      });

    } catch (error) {
      console.error("CRITICAL KONVA ERROR: Failed to initialize Konva components (stage/layer).", error);
    }
  };
  
  useEffect(() => {
    // We need to wait for both Konva to be loaded and the canvas component to be ready.
    if ((window as any).Konva && isCanvasReady) {
      initializeKonva();
    }
  }, [isCanvasReady, selectedNode]);

  const handleAddShape = (config: any) => {
    if (!canvasRef.current) return;
    const { stage, layer } = canvasRef.current;

    let newShape;
    const x = stage.width() / 4;
    const y = stage.height() / 4;
    const size = 100;
    
    const commonAttrs = {
        x,
        y,
        draggable: true,
        name: 'shape',
        'data-type': config.type,
    };

    switch (config.type) {
      case 'rect':
        newShape = new window.Konva.Rect({ ...commonAttrs, width: size, height: size, fill: config.color });
        break;
      case 'circle':
        newShape = new window.Konva.Circle({ ...commonAttrs, radius: size / 2, fill: config.color });
        break;
      case 'triangle':
        newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2, fill: config.color });
        break;
      case 'line':
        newShape = new window.Konva.Line({ ...commonAttrs, points: [0, 0, size, 0], stroke: config.color, strokeWidth: config.thickness, x: x, y: y });
        newShape.x(x); // Manually set x and y for line
        newShape.y(y);
        break;
      case 'star':
        newShape = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: 20, outerRadius: 40, fill: config.color });
        break;
      case 'pentagon':
        newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 5, radius: size / 2, fill: config.color });
        break;
      case 'polygon':
        newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size/2, fill: config.color });
        break;
      case 'arrow':
        newShape = new window.Konva.Arrow({ ...commonAttrs, points: [0, 0, size, 0], pointerLength: 10, pointerWidth: 10, fill: config.color, stroke: config.color, strokeWidth: config.thickness, x: x, y: y });
        newShape.x(x);
        newShape.y(y);
        break;
    }
    if(newShape) {
      layer.add(newShape);
      layer.draw();
      setSelectedNode(newShape);
    }
    setShapeDialogOpen(false);
  }

  const handleUpdateShape = (attrs: any) => {
    if (editingShapeNode) {
        if (attrs.color) {
            if (editingShapeNode.getAttr('data-type') === 'line' || editingShapeNode.getAttr('data-type') === 'arrow') {
                editingShapeNode.stroke(attrs.color);
            } else {
                editingShapeNode.fill(attrs.color);
            }
             if (editingShapeNode.getAttr('data-type') === 'arrow') {
                editingShapeNode.fill(attrs.color);
            }
        }
        if (attrs.thickness) {
            editingShapeNode.strokeWidth(attrs.thickness);
        }
        if (attrs.sides) {
            editingShapeNode.sides(attrs.sides);
        }
        canvasRef.current?.layer.draw();
    }
  }

  const handleSelectItem = (itemType: string) => {
    setAddItemDialogOpen(false);
    deselectNode();

    switch (itemType) {
      case 'text':
        resetTextDialog();
        setTextDialogOpen(true);
        break;
      case 'shape':
        setEditingShapeNode(null);
        setShapeDialogOpen(true);
        break;
      case 'image':
        addImageFromComputer();
        break;
      case 'frame':
        resetFrameDialog();
        setFrameDialogOpen(true);
        break;
      case 'mask':
        resetMaskDialog();
        setMaskDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const addImageFromComputer = () => {
    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";

    imageFileInput.onchange = () => {
        if (imageFileInput.files && imageFileInput.files.length > 0) {
            const file = imageFileInput.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                    const { stage, layer } = canvasRef.current;
                    const MAX_WIDTH = stage.width() * 0.8;
                    const MAX_HEIGHT = stage.height() * 0.8;
                    const scale = Math.min(MAX_WIDTH / img.width(), MAX_HEIGHT / img.height(), 1);

                    img.setAttrs({
                        x: (stage.width() - img.width() * scale) / 2,
                        y: (stage.height() - img.height() * scale) / 2,
                        scaleX: scale,
                        scaleY: scale,
                        name: 'image',
                        draggable: true,
                    });
                    layer.add(img);
                    setSelectedNode(img);
                    layer.draw();
                });
            };
            reader.readAsDataURL(file);
        }
        imageFileInput.value = ''; // Reset for next time
    };
    imageFileInput.click();
  }

  const resetTextDialog = () => {
      const dialogTitle = document.getElementById('dialog-title');
      const addTextBtn = document.getElementById('add-btn');
      const textInput = document.getElementById('text-input') as HTMLInputElement;
      const textFontSizeInput = document.getElementById('text-font-size') as HTMLInputElement;
      const textFontFamilySelect = document.getElementById('text-font-family') as HTMLSelectElement;
      const textColorPicker = document.getElementById('text-color-picker') as HTMLInputElement;
      const colorPreviewText = document.getElementById('color-preview-text') as HTMLElement;
      const boldBtn = document.getElementById('bold-btn') as HTMLElement;
      const italicBtn = document.getElementById('italic-btn') as HTMLElement;
      const underlineBtn = document.getElementById('underline-btn') as HTMLElement;
      const strikethroughBtn = document.getElementById('strikethrough-btn') as HTMLElement;
      const dropShadowBtn = document.getElementById('drop-shadow-btn') as HTMLElement;
      const shadowControls = document.getElementById('shadow-controls') as HTMLElement;
      const glowBtn = document.getElementById('glow-btn') as HTMLElement;
      const glowControls = document.getElementById('glow-controls') as HTMLElement;
      const glowColorPicker = document.getElementById('glow-color-picker') as HTMLInputElement;
      const colorPreviewGlow = document.getElementById('color-preview-glow') as HTMLElement;
      const letterSpacingSlider = document.getElementById('letter-spacing-slider') as HTMLInputElement;
      const lineHeightSlider = document.getElementById('line-height-slider') as HTMLInputElement;
      const circularTextRadius = document.getElementById('circular-text-radius') as HTMLInputElement;
      const circularTextCurvature = document.getElementById('circular-text-curvature') as HTMLInputElement;

      if(dialogTitle) dialogTitle.textContent = 'Add Text';
      if(addTextBtn) addTextBtn.textContent = 'Add';
      if(textInput) textInput.value = '';
      if(textFontSizeInput) textFontSizeInput.value = '24';
      if(textFontFamilySelect) textFontFamilySelect.value = 'Inter';
      if(textColorPicker) textColorPicker.value = '#000000';
      if(colorPreviewText) colorPreviewText.style.backgroundColor = '#000000';
      boldBtn?.classList.remove('active');
      italicBtn?.classList.remove('active');
      underlineBtn?.classList.remove('active');
      strikethroughBtn?.classList.remove('active');
      dropShadowBtn?.classList.remove('active');
      if(shadowControls) shadowControls.classList.add('hidden');
      glowBtn?.classList.remove('active');
      if(glowControls) glowControls.classList.add('hidden');
      if(glowColorPicker) glowColorPicker.value = '#0000ff';
      if(colorPreviewGlow) colorPreviewGlow.style.backgroundColor = '#0000ff';
      if(letterSpacingSlider) letterSpacingSlider.value = '0';
      if(lineHeightSlider) lineHeightSlider.value = '1';
      document.querySelectorAll('#text-align-container button').forEach(btn => btn.classList.remove('active'));
      document.querySelector('#text-align-container button[data-align="left"]')?.classList.add('active');
      if(circularTextRadius) circularTextRadius.value = '150';
      if(circularTextCurvature) circularTextCurvature.value = '0';
  };


  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/konva@9.3.6/konva.min.js"
        strategy="lazyOnload"
        onLoad={() => {
            if (typeof window !== 'undefined' && (window as any).Konva) {
              setCanvasReady(true)
            }
        }}
      />
      <main>
        <div id="editor-ui">
            <div className="editor-main-column">
                <h2 className="text-xl font-semibold text-center mb-4">Canvas Editor</h2>
                
                <Canvas ref={canvasRef} canvasSize={canvasSize} onReady={() => setCanvasReady(true)} />
                
                <div id="controls" className="bg-white p-4 rounded-xl shadow-lg mt-4">
                    <div className="mb-4">
                        <label htmlFor="canvas-size" className="block text-sm font-medium text-gray-700 mb-2">Select Canvas Size</label>
                        <select id="canvas-size" value={canvasSize} onChange={(e) => setCanvasSize(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="500x500">Square (500x500)</option>
                            <option value="375x667">Phone (375x667)</option>
                            <option value="1920x1080">HD Screen (1920x1080)</option>
                            <option value="1366x768">Laptop (1366x768)</option>
                            <option value="2384x3370">A1 (2384x3370)</option>
                            <option value="1684x2384">A2 (1684x2384)</option>
                            <option value="1191x1684">A3 (1191x1684)</option>
                            <option value="842x1191">A4 (842x1191)</option>
                            <option value="595x842">A5 (595x842)</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <div className="color-picker-container-inline">
                            <label htmlFor="background-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Background Color</label>
                            <div id="color-preview-background" className="color-preview-circle" style={{backgroundColor: backgroundColor}}></div>
                            <input type="color" id="background-color-picker" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="color-picker-input-hidden" />
                        </div>
                    </div>
                     <div id="object-properties" className="hidden">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Object Properties</h4>
                        <div className="alignment-controls">
                            <button id="align-top-btn" className="align-btn" title="Align Top"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="3"></line><line x1="5" y1="5" x2="19" y2="5"></line><rect x="5" y="9" width="14" height="10" rx="2"></rect></svg></button>
                            <button id="align-left-btn" className="align-btn" title="Align Left"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="3" y2="12"></line><line x1="5" y1="5" x2="5" y2="19"></line><rect y="5" x="9" width="10" height="14" rx="2"></rect></svg></button>
                            <button id="align-center-btn" className="align-btn" title="Center on Canvas"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="12" y2="12" /><line x1="12" x2="12" y1="3" y2="21" /></svg></button>
                            <button id="align-right-btn" className="align-btn" title="Align Right"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="21" y2="12"></line><line x1="19" y1="5" x2="19" y2="19"></line><rect y="5" x="5" width="10" height="14" rx="2"></rect></svg></button>
                            <button id="align-bottom-btn" className="align-btn" title="Align Bottom"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="21"></line><line x1="5" y1="19" x2="19" y2="19"></line><rect x="5" y="5" width="14" height="10" rx="2"></rect></svg></button>
                        </div>
                        <div className="opacity-controls">
                            <label htmlFor="opacity-slider">Opacity</label>
                            <input type="range" id="opacity-slider" min="0" max="1" step="0.05" defaultValue="1" />
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                        <button id="add-item-btn" className="button button-primary flex-grow" onClick={() => { setAddItemDialogOpen(true); deselectNode(); }}>Add Item</button>
                        <button id="delete-btn" className="button button-danger flex-grow hidden">Delete</button>
                        <button id="save-btn" className="button button-primary flex-grow">Save as Image</button>
                    </div>
                </div>
            </div>

            <div id="layers-panel">
                <h3 className="text-lg font-semibold mb-4 text-center">Layers</h3>
                <ul id="layers-list"></ul>
            </div>
        
        <AddItemDialog 
            isOpen={isAddItemDialogOpen} 
            onClose={() => setAddItemDialogOpen(false)} 
            onSelectItem={handleSelectItem} 
        />

        <div id="text-dialog" className="dialog-overlay" style={{ display: isTextDialogOpen ? 'flex' : 'none' }}>
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

        <ShapeDialog 
            isOpen={isShapeDialogOpen} 
            onClose={() => setShapeDialogOpen(false)} 
            onAddShape={handleAddShape}
            onUpdateShape={handleUpdateShape}
            editingNode={editingShapeNode}
        />

        <div id="frame-dialog" className="dialog-overlay" style={{ display: isFrameDialogOpen ? 'flex' : 'none' }}>
            <div className="dialog">
                <h3 className="text-lg font-semibold mb-4">Add a Frame</h3>
                <div className="flex flex-col gap-4 mb-4">
                     <div className="color-picker-container-inline justify-center">
                        <label htmlFor="frame-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Color</label>
                        <div id="color-preview-frame" className="color-preview-circle" style={{backgroundColor: '#3b82f6'}}></div>
                        <input type="color" id="frame-color-picker" defaultValue="#3b82f6" className="color-picker-input-hidden" />
                    </div>
                    <div id="frame-thickness-controls">
                        <label htmlFor="frame-thickness-slider" className="block text-sm font-medium text-gray-700">
                            Thickness (<span id="frame-thickness-value">10</span>px)
                        </label>
                        <input type="range" id="frame-thickness-slider" min="1" max="50" step="1" defaultValue="10" className="w-full" />
                    </div>
                    <div id="frame-sides-controls" className="hidden">
                        <label htmlFor="frame-sides-slider" className="block text-sm font-medium text-gray-700">
                            Sides (<span id="frame-sides-value">6</span>)
                        </label>
                        <input type="range" id="frame-sides-slider" min="3" max="12" step="1" defaultValue="6" className="w-full" />
                    </div>
                </div>

                <div id="frame-buttons-container" className="shape-button-container mt-4">
                    <button className="shape-btn" data-frame-shape="rect" title="Rectangle Frame">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1" /></svg>
                    </button>
                    <button className="shape-btn" data-frame-shape="circle" title="Circle Frame">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>
                    </button>
                     <button className="shape-btn" data-frame-shape="triangle" title="Triangle Frame">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L1 21h22L12 2z"/></svg>
                    </button>
                    <button className="shape-btn" data-frame-shape="star" title="Star Frame">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </button>
                    <button className="shape-btn" data-frame-shape="polygon" title="Polygon Frame">
                        <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M12 2.5l7.79 4.5v9l-7.79 4.5-7.79-4.5v-9L12 2.5z"/></svg>
                    </button>
                    <button className="shape-btn" data-frame-shape="diamond" title="Diamond Frame">
                        <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M12 2L22 12 12 22 2 12 12 2z"/></svg>
                    </button>
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4">
                    <button id="cancel-frame-btn" className="dialog-button dialog-button-secondary">Close</button>
                    <button id="add-frame-btn" className="dialog-button dialog-button-primary hidden">Add Frame</button>
                </div>
            </div>
        </div>

        <div id="mask-dialog" className="dialog-overlay" style={{ display: isMaskDialogOpen ? 'flex' : 'none' }}>
            <div className="dialog" style={{maxWidth: '500px'}}>
                <h3 className="text-lg font-semibold mb-4">Add a Mask</h3>
                <div className="flex flex-col gap-4 mb-4">
                     <div className="color-picker-container-inline justify-center">
                        <label htmlFor="mask-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Border Color</label>
                        <div id="color-preview-mask" className="color-preview-circle" style={{backgroundColor: '#3b82f6'}}></div>
                        <input type="color" id="mask-color-picker" defaultValue="#3b82f6" className="color-picker-input-hidden" />
                    </div>
                    <div id="mask-border-thickness-controls">
                        <label htmlFor="mask-border-thickness-slider" className="block text-sm font-medium text-gray-700">
                           Border Thickness (<span id="mask-border-thickness-value">0</span>px)
                        </label>
                        <input type="range" id="mask-border-thickness-slider" min="0" max="50" step="1" defaultValue="0" className="w-full" />
                    </div>
                    <div id="mask-sides-controls" className="hidden">
                        <label htmlFor="mask-sides-slider" className="block text-sm font-medium text-gray-700">
                            Sides (<span id="mask-sides-value">6</span>)
                        </label>
                        <input type="range" id="mask-sides-slider" min="3" max="12" step="1" defaultValue="6" className="w-full" />
                    </div>
                </div>

                <div id="mask-buttons-container" className="shape-button-container mt-4">
                    <button className="shape-btn" data-mask-shape="rect" title="Rectangle Mask">
                        <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                    </button>
                    <button className="shape-btn" data-mask-shape="circle" title="Circle Mask">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
                    </button>
                     <button className="shape-btn" data-mask-shape="triangle" title="Triangle Mask">
                        <svg viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2z"/></svg>
                    </button>
                    <button className="shape-btn" data-mask-shape="star" title="Star Mask">
                        <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    </button>
                    <button className="shape-btn" data-mask-shape="polygon" title="Polygon Mask">
                        <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"><path d="M12 2.5l7.79 4.5 0 9 -7.79 4.5 -7.79 -4.5 0 -9Z"/></svg>
                    </button>
                    <button className="shape-btn" data-mask-shape="diamond" title="Diamond Mask">
                        <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"><path d="M12 2L22 12 12 22 2 12 12 2Z"/></svg>
                    </button>
                </div>
                 <div id="alphabet-masks-container" className="shape-button-container mt-4">
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                        <button key={letter} className="shape-btn" data-alphabet-mask={letter} title={`Mask: ${letter}`}>
                            <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{letter}</span>
                        </button>
                    ))}
                </div>
                <div className="dialog-actions flex justify-end gap-2 mt-4">
                    <button id="cancel-mask-btn" className="dialog-button dialog-button-secondary">Close</button>
                    <button id="add-mask-btn" className="dialog-button dialog-button-primary hidden">Add Mask</button>
                </div>
            </div>
        </div>
        </div>
      </main>
    </>
  );
}
    

    

    




    

    

    



    

    

    



    

    

    

    





    

    