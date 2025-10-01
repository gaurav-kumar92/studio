
'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Canvas from '@/components/editor/Canvas';
import ShapeDialog from '@/components/editor/ShapeDialog';
import FrameDialog from '@/components/editor/FrameDialog';
import MaskDialog from '@/components/editor/MaskDialog';
import AddItemDialog from '@/components/editor/AddItemDialog';
import TextDialog from '@/components/editor/TextDialog';
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
  const canvasRef = useRef<{ stage: any; layer: any; background: any; }>(null);
  const transformerRef = useRef<any>(null);
  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [canvasSize, setCanvasSize] = useState('842x1191');
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isShapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [isTextDialogOpen, setTextDialogOpen] = useState(false);
  const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
  const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
  
  const [editingShapeNode, setEditingShapeNode] = useState<any>(null);
  const [editingFrameNode, setEditingFrameNode] = useState<any>(null);
  const [editingMaskNode, setEditingMaskNode] = useState<any>(null);
  const [editingTextNode, setEditingTextNode] = useState<any>(null);

  const isCircular = canvasSize.endsWith('-circle');
  const sizeString = canvasSize.split('-')[0];

  const updateLayers = () => {
    if (!canvasRef.current?.layer) return;
  
    const children = canvasRef.current.layer.getChildren(
      (node: any) => node.name() !== 'background' && node.className !== 'Transformer'
    );
  
    const childrenArray = Array.from(children);
    setKonvaObjects(childrenArray);
  
    canvasRef.current.layer.draw();
  };
  

  useEffect(() => {
    if (canvasRef.current?.background && isCanvasReady) {
      canvasRef.current.background.fill(backgroundColor);
      if (canvasRef.current.layer) {
          canvasRef.current.layer.draw();
      }
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
        // No custom boundBoxFunc needed if group dimensions are correct
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

  const addImageToMask = (maskGroup: any) => {
      if (!maskGroup || maskGroup.name() !== 'mask' || !canvasRef.current?.layer) return;
      const layer = canvasRef.current.layer;

      const imageFileInput = document.createElement('input');
      imageFileInput.type = 'file';
      imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";
      imageFileInput.style.display = 'none';
      document.body.appendChild(imageFileInput);


      imageFileInput.onchange = () => {
          if (imageFileInput.files && imageFileInput.files.length > 0) {
              const file = imageFileInput.files[0];
              const reader = new FileReader();
              reader.onloadstart = () => setIsLoading(true);
              reader.onload = (e) => {
                  window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                      // Clear existing content
                      maskGroup.find('.placeholder-icon, .mask-image').forEach((child: any) => child.destroy());
                      
                      const maskWidth = maskGroup.width();
                      const maskHeight = maskGroup.height();
                      const imgWidth = img.width();
                      const imgHeight = img.height();
                      
                      // Scale image to fill mask
                      const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);
                      
                      img.setAttrs({
                          name: 'mask-image',
                          x: maskWidth / 2,
                          y: maskHeight / 2,
                          offsetX: img.width() / 2,
                          offsetY: img.height() / 2,
                          scaleX: scale,
                          scaleY: scale,
                          draggable: true,
                          dragBoundFunc: function(pos: { x: number, y: number }) {
                            const imgRect = this.getClientRect({skipTransform: false});
                            const maskRect = {x: 0, y: 0, width: maskWidth, height: maskHeight};

                            const newAbsX = pos.x + maskGroup.x();
                            const newAbsY = pos.y + maskGroup.y();

                            let minX = maskGroup.x() + maskRect.width - imgRect.width;
                            let maxX = maskGroup.x();
                            let minY = maskGroup.y() + maskRect.height - imgRect.height;
                            let maxY = maskGroup.y();
                            
                            const boundedX = Math.max(minX, Math.min(newAbsX, maxX));
                            const boundedY = Math.max(minY, Math.min(newAbsY, maxY));

                            return {
                                x: boundedX - maskGroup.x(),
                                y: boundedY - maskGroup.y(),
                            };
                          }
                      });
                      
                      const borderShape = maskGroup.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text,Path');
                      if (borderShape) {
                           borderShape.fill('transparent');
                      }
                      
                      maskGroup.add(img);
                      img.moveToBottom();


                      layer.draw();
                      updateLayers();
                      setIsLoading(false);
                  });
              };
              reader.onerror = () => {
                setIsLoading(false);
                console.error("Failed to read file");
              };
              reader.readAsDataURL(file);
          }
          imageFileInput.value = '';
          document.body.removeChild(imageFileInput);
      };
      imageFileInput.click();
  };


  const selectNode = (node: any) => {
    if (!canvasRef.current?.layer) return;
    const { layer, stage } = canvasRef.current;
    
    // If it's a child of a group, select the group.
    let nodeToSelect = node;
    if (node.parent?.hasName('circularText') || node.parent?.hasName('mask') || node.parent?.hasName('textGroup')) {
      nodeToSelect = node.parent;
    }

    if (nodeToSelect === selectedNode) {
        return;
    }
    
    setSelectedNode(nodeToSelect);
    
    // Image Specific
    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";
    imageFileInput.style.display = 'none';
    document.body.appendChild(imageFileInput);


    // Remove previous listeners to avoid duplicates
    nodeToSelect.off('dblclick dbltap');
    nodeToSelect.on('dblclick dbltap', () => {
         if (nodeToSelect.hasName('text') || nodeToSelect.hasName('circularText') || nodeToSelect.hasName('textGroup')) {
            setEditingTextNode(nodeToSelect);
            setTextDialogOpen(true);
        } else if (nodeToSelect.hasName('shape')) {
          setEditingShapeNode(nodeToSelect);
          setShapeDialogOpen(true);
        } else if (nodeToSelect.hasName('image')) {
            // This logic is for replacing an existing image.
            imageFileInput.onchange = () => {
                if (imageFileInput.files && imageFileInput.files.length > 0) {
                    const file = imageFileInput.files[0];
                    const reader = new FileReader();
                    reader.onloadstart = () => setIsLoading(true);
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
                            setIsLoading(false);
                        });
                    };
                    reader.onerror = () => setIsLoading(false);
                    reader.readAsDataURL(file);
                }
                imageFileInput.value = ''; // Reset input
            };
            imageFileInput.click();
        } else if (nodeToSelect.hasName('frame')) {
            setEditingFrameNode(nodeToSelect);
            setFrameDialogOpen(true);
        } else if (nodeToSelect.hasName('mask')) {
             addImageToMask(nodeToSelect);
        }
    });
    document.body.removeChild(imageFileInput);
};

  const initializeKonva = () => {
    if (!canvasRef.current || !canvasRef.current.stage) {
      return;
    }

    const { stage, layer } = canvasRef.current;


    // --- 1. Element References ---
    const saveBtn = document.getElementById('save-btn');
    
    // --- 3. UI and Helper Functions (Declared after variables) ---
    
    
    // --- 4. Core Button Listeners (Dialog Control) ---
    
    // --- 5. Konva Initialization ---
    if (typeof window.Konva === 'undefined') {
      console.error('Konva library is not loaded. Canvas features are disabled.');
      return;
    }

    try {
      if (!stage) {
        console.error("Stage is not initialized. Cannot proceed.");
        return;
      }
      updateLayers();
      
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

      saveBtn?.addEventListener('click', () => {
        deselectNode();
        if (!stage) return;
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

        let targetNode = e.target;
        // Special handling for text children
        if (e.target.parent?.hasName('circularText') || e.target.parent?.hasName('textGroup') || e.target.parent?.hasName('mask')) {
            targetNode = e.target.parent;
        }

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
  }, [isCanvasReady, selectedNode]);

  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const children = canvasRef.current.layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer');
    const newChildren = Array.from(children || []);
    setKonvaObjects(newChildren);
  }, [selectedNode]);

const applyFill = (node: any, config: any) => {
    const targetNodes = (node.hasName('textGroup') || node.hasName('circularText')) 
      ? node.find('.mainChar, .text, Text') 
      : [node];

    targetNodes.forEach((n: any) => {
        if (config.isGradient) {
            let start = { x: 0, y: 0 };
            let end = { x: 0, y: 0 };
            const { width, height } = n.getClientRect({ relativeTo: n.getParent() });

            switch (config.gradientDirection) {
                case 'top-to-bottom': end = { x: 0, y: height }; break;
                case 'left-to-right': end = { x: width, y: 0 }; break;
                case 'diagonal-tl-br': end = { x: width, y: height }; break;
                case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
            }
            n.fill(null);
            n.fillLinearGradientStartPoint(start);
            n.fillLinearGradientEndPoint(end);
            const colorStopsFlat = config.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);
            n.fillLinearGradientColorStops(colorStopsFlat);
        } else {
            n.fillLinearGradientColorStops([]);
            n.fill(config.solidColor);
        }
    });
};

  const handleAddShape = (config: any) => {
    if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
    const { stage, layer } = canvasRef.current;
    const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
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
        newShape = new window.Konva.Rect({ ...commonAttrs, width: size, height: size });
        break;
      case 'circle':
        newShape = new window.Konva.Circle({ ...commonAttrs, radius: size / 2 });
        break;
      case 'triangle':
        newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2 });
        break;
      case 'line':
        newShape = new window.Konva.Line({ ...commonAttrs, points: [0, 0, size, 0], strokeWidth: config.thickness, x: x, y: y });
        newShape.x(x); 
        newShape.y(y);
        break;
      case 'curve':
        newShape = new window.Konva.Line({ ...commonAttrs, points: [0, 0, size / 2, size / 2, size, 0], strokeWidth: config.thickness, tension: config.tension, x: x, y: y, 'data-tension': config.tension, });
        newShape.x(x);
        newShape.y(y);
        break;
      case 'star':
        newShape = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: 20, outerRadius: 40 });
        break;
      case 'pentagon':
        newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 5, radius: size / 2 });
        break;
      case 'polygon':
        newShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size/2 });
        break;
      case 'arrow':
        newShape = new window.Konva.Arrow({ ...commonAttrs, points: [0, 0, size, 0], pointerLength: 10, pointerWidth: 10, strokeWidth: config.thickness, x: x, y: y });
        newShape.x(x);
        newShape.y(y);
        break;
    }
    if(newShape) {
       newShape.setAttrs({
            'data-is-gradient': false,
            'data-solid-color': '#3b82f6',
        });
        if (config.type === 'line' || config.type === 'arrow' || config.type === 'curve') {
            newShape.stroke('#3b82f6');
            if (config.type === 'arrow') newShape.fill('#3b82f6');
        } else {
            newShape.fill('#3b82f6');
        }
      layer.add(newShape);
      updateLayers();
      layer.draw();
      setSelectedNode(newShape);
      newShape.setAttr('id', uniqueId);
    }
    setShapeDialogOpen(false);
  }

  const handleUpdateShape = (attrs: any) => {
    if (!editingShapeNode) return;
    if (attrs.thickness) {
        editingShapeNode.strokeWidth(attrs.thickness);
    }
    if (attrs.sides && editingShapeNode.getClassName() === 'RegularPolygon') {
        editingShapeNode.sides(attrs.sides);
    }
    if (attrs.tension !== undefined) {
        editingShapeNode.tension(attrs.tension);
        editingShapeNode.setAttr('data-tension', attrs.tension);
    }
    canvasRef.current?.layer.draw();
  }

  const handleAddFrame = (config: any) => {
    if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
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
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        newFrame.setAttr('id', uniqueId); // <--- add this line
    }
    setFrameDialogOpen(false);
  };

  const handleUpdateFrame = (attrs: any) => {
    if (!editingFrameNode) return;
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
  };

  const handleAddMask = (config: any) => {
    if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
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

    if (borderShape) {
        group.add(borderShape);
    }

    const placeholderSvgPath = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
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
        if (borderShape) {
             borderShape._sceneFunc(ctx);
        }
    });

    layer.add(group);
    updateLayers();
    layer.draw();
    setSelectedNode(group);
    setMaskDialogOpen(false);
    const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    group.setAttr('id', uniqueId);

  };

  const handleUpdateMask = (attrs: any) => {
    if (!editingMaskNode) return;
    const border = editingMaskNode.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text');
    if (border) {
      if (attrs.borderColor) {
        border.stroke(attrs.borderColor);
      }
      if (attrs.borderThickness) {
        border.strokeWidth(attrs.borderThickness);
      }
       if (attrs.sides && border.getClassName() === 'RegularPolygon') {
        border.sides(attrs.sides);
      }
    }
    canvasRef.current?.layer.draw();
  };

  const handleAddOrUpdateText = (config: any) => {
    if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
    const { stage, layer } = canvasRef.current;
    
    if (editingTextNode) {
        // Preserve color properties during update
        config['data-is-gradient'] = editingTextNode.getAttr('data-is-gradient');
        config['data-solid-color'] = editingTextNode.getAttr('data-solid-color');
        config['data-color-stops'] = editingTextNode.getAttr('data-color-stops');
        config['data-gradient-direction'] = editingTextNode.getAttr('data-gradient-direction');
        
        editingTextNode.destroy();
        deselectNode();
        setEditingTextNode(null);
    }

     const dataAttrs = {
        'data-text': config.text,
        'data-font-size': config.fontSize,
        'data-font-family': config.fontFamily,
        'data-is-gradient': config['data-is-gradient'] || false,
        'data-solid-color': config['data-solid-color'] || '#000000',
        'data-color-stops': config['data-color-stops'] || [],
        'data-gradient-direction': config['data-gradient-direction'] || 'top-to-bottom',
        'data-letter-spacing': config.letterSpacing,
        'data-line-height': config.lineHeight,
        'data-align': config.align,
        'data-is-bold': config.isBold,
        'data-is-italic': config.isItalic,
        'data-is-underline': config.isUnderline,
        'data-is-strikethrough': config.isStrikethrough,
        'data-is-shadow': config.isShadow,
        'data-shadow-blur': config.shadowBlur,
        'data-shadow-distance': config.shadowDistance,
        'data-shadow-opacity': config.shadowOpacity,
        'data-is-glow': config.isGlow,
        'data-glow-color': config.glowColor,
        'data-glow-blur': config.glowBlur,
        'data-glow-opacity': config.glowOpacity,
        'data-radius': config.radius,
        'data-curvature': config.curvature,
    };

    let newNode;
    if (config.curvature > 0) {
        const circularGroup = new window.Konva.Group({
          x: stage.width() / 2,
          y: stage.height() / 2,
          draggable: true,
          name: 'circularText',
          ...dataAttrs
        });
        newNode = circularGroup;

        const tempText = new window.Konva.Text({ text: config.text, fontSize: config.fontSize, fontFamily: config.fontFamily });
        const charHeight = tempText.height();
        const maxAngleRadians = 2 * Math.PI * (config.curvature / 100);

        let totalFlatWidth = 0;
        for (const char of config.text) {
          tempText.text(char);
          totalFlatWidth += tempText.width();
        }
        const totalFlatAngle = totalFlatWidth / config.radius;
        const scaleFactor = (totalFlatAngle > 0 && maxAngleRadians > 0) ? maxAngleRadians / totalFlatAngle : 0;
        let cumulativeAngle = 0;

        const fontStyle = `${config.isBold ? 'bold ' : ''}${config.isItalic ? 'italic' : ''}`.trim();
        const decorations = [];
        if (config.isUnderline) decorations.push('underline');
        if (config.isStrikethrough) decorations.push('line-through');


        for (let i = 0; i < config.text.length; i++) {
          const char = config.text[i];
          tempText.text(char);
          let charWidth = tempText.width();
          const charAngularWidth = charWidth / config.radius;
          const scaledAngularWidth = charAngularWidth * scaleFactor;
          const centerAngle = cumulativeAngle + (scaledAngularWidth / 2);

          const placementAngle = centerAngle - (Math.PI / 2); 
          const x = config.radius * Math.cos(placementAngle);
          const y = config.radius * Math.sin(placementAngle);
          const rotationDegrees = centerAngle * 180 / Math.PI;

          const charNode = new window.Konva.Text({
            text: char,
            x: x,
            y: y,
            fontSize: config.fontSize,
            fontFamily: config.fontFamily,
            fontStyle: fontStyle,
            textDecoration: decorations.join(' '),
            rotation: rotationDegrees,
            offsetX: charWidth / 2,
            offsetY: charHeight / 2,
            name: 'mainChar',
            fill: '#000000'
          });
          
           if (config.isGlow) {
              const glowNode = charNode.clone({
                fill: config.glowColor,
                stroke: config.glowColor,
                strokeWidth: config.glowBlur,
                name: 'glowEffect'
              });
              glowNode.cache();
              glowNode.filters([window.Konva.Filters.Blur]);
              glowNode.blurRadius(config.glowBlur);
              glowNode.opacity(config.glowOpacity);
              circularGroup.add(glowNode);
          }

          if (config.isShadow) {
              charNode.shadowEnabled(true);
              charNode.shadowColor('#000000');
              charNode.shadowBlur(config.shadowBlur);
              charNode.shadowOffset({ x: config.shadowDistance, y: config.shadowDistance });
              charNode.shadowOpacity(config.shadowOpacity);
          } else {
              charNode.shadowEnabled(false);
          }

          circularGroup.add(charNode);
          cumulativeAngle += scaledAngularWidth;
        }

        const totalArcWidth = cumulativeAngle;
        circularGroup.rotation(-totalArcWidth * 180 / (2 * Math.PI));

    } else {
         const textGroup = new window.Konva.Group({
            x: stage.width() / 4,
            y: stage.height() / 4,
            draggable: true,
            name: 'textGroup',
            ...dataAttrs
        });
        newNode = textGroup;
        
        const mainText = new window.Konva.Text({
            ...config,
            fill: '#000000',
            name: 'text',
        });
        
        let decorations = [];
        if (config.isUnderline) decorations.push('underline');
        if (config.isStrikethrough) decorations.push('line-through');
        mainText.textDecoration(decorations.join(' '));

        mainText.fontStyle(`${config.isBold ? 'bold ' : ''}${config.isItalic ? 'italic' : ''}`.trim());
        
        if (config.isGlow) {
            const glowText = mainText.clone({
                fill: config.glowColor,
                stroke: config.glowColor,
                strokeWidth: config.glowBlur,
                name: 'glowEffect'
            });
            glowText.cache();
            glowText.filters([window.Konva.Filters.Blur]);
            glowText.blurRadius(config.glowBlur);
            glowText.opacity(config.glowOpacity);
            textGroup.add(glowText);
        }

        if (config.isShadow) {
            mainText.shadowEnabled(true);
            mainText.shadowColor('#000000');
            mainText.shadowBlur(config.shadowBlur);
            mainText.shadowOffset({ x: config.shadowDistance, y: config.shadowDistance });
            mainText.shadowOpacity(config.shadowOpacity);
        } else {
            mainText.shadowEnabled(false);
        }

        textGroup.add(mainText);
    }

    if (newNode) {
        layer.add(newNode);
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        newNode.setAttr('id', uniqueId);
        
        const colorConfig = {
            isGradient: newNode.getAttr('data-is-gradient'),
            solidColor: newNode.getAttr('data-solid-color'),
            colorStops: newNode.getAttr('data-color-stops'),
            gradientDirection: newNode.getAttr('data-gradient-direction'),
        };
        applyFill(newNode, colorConfig);
        
        setSelectedNode(newNode);
    }
    
    updateLayers();
    layer.draw();
    setTextDialogOpen(false);
  };


  const handleSelectItem = (itemType: string) => {
    setAddItemDialogOpen(false);
    deselectNode();

    if (!canvasRef.current) return;

    switch (itemType) {
      case 'text':
        setEditingTextNode(null);
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
    imageFileInput.accept = "image/png, image/jpeg,_jpg, image/gif, image/svg+xml";

    imageFileInput.onchange = () => {
        if (imageFileInput.files && imageFileInput.files.length > 0) {
            const file = imageFileInput.files[0];
            const reader = new FileReader();
            reader.onloadstart = () => setIsLoading(true);
            reader.onload = (e) => {
                window.Konva.Image.fromURL(e.target!.result, (img: any) => {
                    if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
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
                    setIsLoading(false);
                });
            };
            reader.onerror = () => setIsLoading(false);
            reader.readAsDataURL(file);
        }
        imageFileInput.value = ''; // Reset for next time
    };
    imageFileInput.click();
  }

  const handleMoveNode = (action: 'up' | 'down', nodeId: string) => {
    if (!canvasRef.current?.layer) return;
    const { layer } = canvasRef.current;

    const node = layer.findOne(`#${nodeId}`);
    if (!node) return;

    if (action === 'up') {
      node.moveUp();
    } else if (action === 'down') {
      // Prevent moving behind the background
      if (node.getZIndex() > 1) {
        node.moveDown();
      }
    }

    // Get the updated children list from Konva itself
    const newChildrenArray = layer.getChildren((n: any) => n.name() !== 'background' && n.className !== 'Transformer').toArray();

    // Force a re-render by setting the new array
    setKonvaObjects(newChildrenArray);

    layer.batchDraw();
  };
  
  
  const handleAlign = (position: string) => {
    if (!selectedNode || !canvasRef.current?.stage) return;
    const stage = canvasRef.current.stage;
    const box = selectedNode.getClientRect();

    let newX, newY;

    switch(position) {
        case 'top':
            newY = selectedNode.y() - box.y;
            selectedNode.y(newY);
            break;
        case 'left':
            newX = selectedNode.x() - box.x;
            selectedNode.x(newX);
            break;
        case 'center':
            newX = selectedNode.x() + (stage.width() / 2 - (box.x + box.width / 2));
            newY = selectedNode.y() + (stage.height() / 2 - (box.y + box.height / 2));
            selectedNode.x(newX);
            selectedNode.y(newY);
            break;
        case 'right':
            newX = selectedNode.x() + (stage.width() - (box.x + box.width));
            selectedNode.x(newX);
            break;
        case 'bottom':
            newY = selectedNode.y() - (box.y + box.height - stage.height());
            selectedNode.y(newY);
            break;
    }
    if (canvasRef.current?.layer) canvasRef.current.layer.draw();
  };
  
  const handleOpacityChange = (opacity: number) => {
    if (selectedNode) {
      selectedNode.opacity(opacity);
      if (canvasRef.current?.layer) {
        canvasRef.current.layer.draw();
      }
    }
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    const node = selectedNode;
    if (!node) return;

    if (direction === 'horizontal') {
        const scaleX = node.scaleX();
        node.scaleX(-scaleX);
    } else {
        const scaleY = node.scaleY();
        node.scaleY(-scaleY);
    }

    canvasRef.current?.layer.batchDraw();
  };
  
    const handleColorUpdate = (config: any) => {
        if (!selectedNode) return;

        const nodeType = selectedNode.name();
        const shapeType = selectedNode.getAttr('data-type');
        const isLineOrArrow = shapeType === 'line' || shapeType === 'arrow' || shapeType === 'curve';
        
        selectedNode.setAttrs({
            'data-is-gradient': config.isGradient,
            'data-solid-color': config.solidColor,
            'data-color-stops': config.colorStops,
            'data-gradient-direction': config.gradientDirection,
        });

        if (nodeType === 'shape' && isLineOrArrow) {
            // Lines and arrows only use stroke
            selectedNode.stroke(config.solidColor);
            if (shapeType === 'arrow') {
                selectedNode.fill(config.solidColor); // Arrowhead fill
            }
        } else {
            // All other shapes and text
            applyFill(selectedNode, config);
        }
        
        canvasRef.current?.layer.draw();
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
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      <main>
        <div id="editor-ui">
            <div className="editor-main-column">
                <h2 className="text-xl font-semibold text-center mb-4">Canvas Editor</h2>
                
                <Canvas 
                    ref={canvasRef} 
                    canvasSize={sizeString}
                    isCircular={isCircular}
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
                            onFlip={handleFlip}
                            onColorChange={handleColorUpdate}
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
                onSelectNode={(id) => {
                    const node = canvasRef.current?.layer.findOne(`#${id}`);
                    if (node) {
                      selectNode(node);
                    }
                }}
                onMoveNode={handleMoveNode}
            />
        
        <AddItemDialog 
            isOpen={isAddItemDialogOpen} 
            onClose={() => setAddItemDialogOpen(false)} 
            onSelectItem={handleSelectItem} 
        />

        <TextDialog
            isOpen={isTextDialogOpen}
            onClose={() => setTextDialogOpen(false)}
            onAddOrUpdateText={handleAddOrUpdateText}
            editingNode={editingTextNode}
        />

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

    