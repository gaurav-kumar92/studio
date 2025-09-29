
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Canvas from '@/components/editor/Canvas';
import ShapeDialog from '@/components/editor/ShapeDialog';
import FrameDialog from '@/components/editor/FrameDialog';
import MaskDialog from '@/components/editor/MaskDialog';
import AddItemDialog from '@/components/editor/AddItemDialog';
import LayersPanel from '@/components/editor/LayersPanel';
import ObjectPropertiesPanel from '@/components/editor/ObjectPropertiesPanel';
import BackgroundColorPicker from '@/components/editor/BackgroundColorPicker';
import CanvasSizeSelector from '@/components/editor/CanvasSizeSelector';


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
  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
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
  const [editingFrameNode, setEditingFrameNode] = useState<any>(null);
  const [editingMaskNode, setEditingMaskNode] = useState<any>(null);


  const updateLayers = () => {
    if (!canvasRef.current?.layer) return;
    const nodes = canvasRef.current.layer.getChildren((node: any) => {
      return node.name() !== 'background' && node.className !== 'Transformer';
    });
    setKonvaObjects(nodes.toArray());
  };

  useEffect(() => {
    if (canvasRef.current?.background && isCanvasReady) {
      canvasRef.current.background.fill(backgroundColor);
      canvasRef.current.layer.draw();
    }
  }, [backgroundColor, isCanvasReady]);

  // Handle transformer attachment
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.layer) return;

    const { layer } = canvasRef.current;

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

    const { stage, layer } = canvasRef.current;


    // --- 1. Element References ---
    
    // Dialogs and Controls
    const textDialog = document.getElementById('text-dialog') as HTMLElement;
    const controls = document.getElementById('controls');


    // Buttons
    const cancelTextBtn = document.getElementById('cancel-btn');
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


    // --- 2. Global State Variables ---
    
    // Initialize colors from pickers
    let selectedColorText = textColorPicker.value;
    let selectedColorGlow = glowColorPicker.value;

    // --- 3. UI and Helper Functions (Declared after variables) ---
    
    // Forward declare functions that are called by others before they are defined
    let selectNode: (node: any) => void;
    let addImageToMask: (maskGroup: any) => void;

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
                        updateLayers();
                    });
                };
                reader.readAsDataURL(file);
            }
            imageFileInput.value = '';
        };
        imageFileInput.click();
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
                                updateLayers();
                                layer.draw();
                            });
                        };
                        reader.readAsDataURL(file);
                    }
                    imageFileInput.value = ''; // Reset input
                };
                imageFileInput.click();
            } else if (nodeToSelect.hasName('frame')) {
                setEditingFrameNode(nodeToSelect);
                setFrameDialogOpen(true);
            } else if (nodeToSelect.hasName('mask')) {
                const hasImage = nodeToSelect.findOne('.mask-image');
                if (hasImage) {
                    setEditingMaskNode(nodeToSelect);
                    setMaskDialogOpen(true);
                } else {
                    addImageToMask(nodeToSelect);
                }
            }
        });
    };

    // --- 4. Core Button Listeners (Dialog Control) ---
    
    // --- 5. Konva Initialization ---
    if (typeof window.Konva === 'undefined') {
      console.error('Konva library is not loaded. Canvas features are disabled.');
      return;
    }

    cancelTextBtn?.addEventListener('click', () => setTextDialogOpen(false));
    
    try {
      updateLayers();

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
        updateLayers();
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
        updateLayers();
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
          updateLayers();
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
        if (e.target === stage || e.target.hasName('background')) {
          deselectNode();
          return;
        }

        const targetNode = e.target.hasName('circularText') ? e.target.getParent() : e.target;
        selectNode(targetNode);
      });
      
      stage.on('dragend', () => {
        updateLayers();
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
  }, [isCanvasReady]);

  useEffect(() => {
    updateLayers();
  }, [konvaObjects, selectedNode]);

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
      updateLayers();
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

  const handleAddFrame = (config: any) => {
    if (!canvasRef.current) return;
    const { stage, layer } = canvasRef.current;
    
    let newFrame;
    const x = stage.width() / 4;
    const y = stage.height() / 4;
    const size = 100;

    const commonAttrs = {
        x, y,
        stroke: config.color,
        strokeWidth: config.thickness,
        draggable: true,
        name: 'frame',
        'data-type': config.type
    };

    switch (config.type) {
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
        newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size/2 });
        break;
      case 'diamond':
        newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / (Math.sqrt(2)) });
        break;
    }

    if(newFrame) {
        layer.add(newFrame);
        updateLayers();
        layer.draw();
        setSelectedNode(newFrame);
    }
    setFrameDialogOpen(false);
  };

  const handleUpdateFrame = (attrs: any) => {
    if (editingFrameNode) {
      if (attrs.color) {
        editingFrameNode.stroke(attrs.color);
      }
      if (attrs.thickness) {
        editingFrameNode.strokeWidth(attrs.thickness);
      }
      if (attrs.sides) {
        editingFrameNode.sides(attrs.sides);
      }
      canvasRef.current?.layer.draw();
    }
  };

  const handleAddMask = (config: any) => {
    if (!canvasRef.current) return;
    const { stage, layer } = canvasRef.current;

    const size = 150;
    const group = new window.Konva.Group({
        x: stage.width() / 4,
        y: stage.height() / 4,
        width: size,
        height: size,
        draggable: true,
        name: 'mask',
        'data-type': config.type,
        'data-letter': config.letter,
    });

    let borderShape: any;

    const commonAttrs = {
        x: size / 2, 
        y: size / 2, 
        fill: '#f0f0f0', 
        stroke: config.borderColor,
        strokeWidth: config.borderThickness,
    };

    switch (config.type) {
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
            borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size / 2 });
            break;
        case 'diamond':
            borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / (Math.sqrt(2)) });
            break;
        case 'alphabet':
            borderShape = new window.Konva.Text({
                x: 0,
                y: 0,
                text: config.letter || 'A',
                fontSize: size,
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontStyle: 'bold',
                align: 'center',
                verticalAlign: 'middle',
                width: size,
                height: size,
                fill: '#f0f0f0',
                stroke: config.borderColor,
                strokeWidth: config.borderThickness,
            });
            break;
        default: // rect
            borderShape = new window.Konva.Rect({ x: 0, y: 0, width: size, height: size, fill: '#f0f0f0', stroke: config.borderColor, strokeWidth: config.borderThickness });
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
    updateLayers();
    layer.draw();
    setSelectedNode(group);
    setMaskDialogOpen(false);
  };

  const handleUpdateMask = (attrs: any) => {
    if (editingMaskNode) {
      const border = editingMaskNode.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text');
      if (border) {
        if (attrs.borderColor) {
          border.stroke(attrs.borderColor);
        }
        if (attrs.borderThickness) {
          border.strokeWidth(attrs.borderThickness);
        }
        if (attrs.sides) {
          border.sides(attrs.sides);
        }
      }
      canvasRef.current?.layer.draw();
    }
  };


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
        setEditingFrameNode(null);
        setFrameDialogOpen(true);
        break;
      case 'mask':
        setEditingMaskNode(null);
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
                    updateLayers();
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

  const handleSelectNode = (nodeId: string) => {
    const node = canvasRef.current?.layer.findOne(`#${nodeId}`);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleMoveNode = (action: 'up' | 'down', nodeId: string) => {
    const node = canvasRef.current?.layer.findOne(`#${nodeId}`);
    if (node) {
      if (action === 'up') {
        node.moveUp();
      } else {
        node.moveDown();
      }
      updateLayers();
      canvasRef.current.layer.draw();
    }
  };
  
  const handleAlign = (position: string) => {
    if (!selectedNode || !canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;
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
    canvasRef.current.layer.draw();
  };
  
  const handleOpacityChange = (opacity: number) => {
    if (selectedNode) {
      selectedNode.opacity(opacity);
      canvasRef.current?.layer.draw();
    }
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
                
                <Canvas 
                    ref={canvasRef} 
                    canvasSize={canvasSize} 
                    onReady={() => setCanvasReady(true)}
                />
                
                <div id="controls" className="bg-white p-4 rounded-xl shadow-lg mt-4">
                    
                    <CanvasSizeSelector value={canvasSize} onChange={setCanvasSize} />
                    <BackgroundColorPicker defaultValue={backgroundColor} onChange={setBackgroundColor} />

                    {selectedNode && (
                        <ObjectPropertiesPanel
                            selectedNode={selectedNode}
                            onAlign={handleAlign}
                            onOpacityChange={handleOpacityChange}
                        />
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap mt-4">
                        <button id="add-item-btn" className="button button-primary flex-grow" onClick={() => { setAddItemDialogOpen(true); deselectNode(); }}>Add Item</button>
                        {selectedNode && (
                             <button 
                                id="delete-btn" 
                                className="button button-danger flex-grow"
                                onClick={() => {
                                    if(selectedNode) {
                                        selectedNode.destroy();
                                        deselectNode();
                                        updateLayers();
                                    }
                                }}
                             >
                                Delete
                            </button>
                        )}
                        <button id="save-btn" className="button button-primary flex-grow">Save as Image</button>
                    </div>
                </div>
            </div>

            <LayersPanel 
                layers={konvaObjects}
                selectedNode={selectedNode}
                onSelectNode={handleSelectNode}
                onMoveNode={handleMoveNode}
            />
        
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
        
        <FrameDialog
            isOpen={isFrameDialogOpen}
            onClose={() => setFrameDialogOpen(false)}
            onAddFrame={handleAddFrame}
            onUpdateFrame={handleUpdateFrame}
            editingNode={editingFrameNode}
        />

        <MaskDialog
            isOpen={isMaskDialogOpen}
            onClose={() => setMaskDialogOpen(false)}
            onAddMask={handleAddMask}
            onUpdateMask={handleUpdateMask}
            editingNode={editingMaskNode}
        />

        </div>
      </main>
    </>
  );
}
    

    