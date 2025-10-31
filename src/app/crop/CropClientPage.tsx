
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';

const CropClientPage = () => {
  const router = useRouter();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200
  });
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  
  const imageRef = useRef<any>(null);
  const cropRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    // Load image from localStorage
    const imageUrl = localStorage.getItem('imageToCrop');
    
    if (!imageUrl) {
      try {
        router.back();
      } catch(e) {
        router.push('/');
      }
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      
      // Calculate dimensions to fit in viewport
      const maxWidth = 800;
      const maxHeight = 600;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      
      const displayWidth = img.width * scale;
      const displayHeight = img.height * scale;
      
      setImageSize({ width: displayWidth, height: displayHeight });
      
      // Set initial crop area (centered, 50% of image)
      const cropWidth = displayWidth * 0.5;
      const cropHeight = displayHeight * 0.5;
      setCropArea({
        x: (displayWidth - cropWidth) / 2,
        y: (displayHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });
    };
    img.src = imageUrl;
  }, [router]);

  useEffect(() => {
    if (transformerRef.current && cropRef.current && image) {
      transformerRef.current.nodes([cropRef.current]);
      const layer = transformerRef.current.getLayer();
      if (layer) {
        layer.batchDraw();
      }
    }
  }, [image]);

  const handleCropChange = (e: any) => {
    const node = e.target;
    const newWidth = node.width() * node.scaleX();
    const newHeight = node.height() * node.scaleY();
    
    setCropArea({
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight
    });
    
    // Reset scale to prevent compound scaling
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleCrop = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const scaleX = image.width / imageSize.width;
    const scaleY = image.height / imageSize.height;
    
    const cropX = cropArea.x * scaleX;
    const cropY = cropArea.y * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    if (ctx) {
      ctx.drawImage(
        image,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
    }
    
    const croppedDataURL = canvas.toDataURL('image/png');
    
    localStorage.setItem('croppedImage', croppedDataURL);
    
     try {
      router.back();
    } catch(e) {
      router.push('/');
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('imageToCrop');
    localStorage.removeItem('imageNodeToCrop');
     try {
      router.back();
    } catch(e) {
      router.push('/');
    }
  };

  if (!image) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading image...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Crop Image</h1>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Apply Crop
            </button>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p>📌 Drag the green rectangle to reposition the crop area</p>
          <p>📌 Use the corner handles to resize the crop area</p>
        </div>

        <div className="flex justify-center bg-gray-200 rounded-lg p-4">
          <Stage 
            ref={stageRef}
            width={imageSize.width} 
            height={imageSize.height}
            className="border-2 border-gray-400 rounded bg-white shadow-inner"
          >
            <Layer>
              <KonvaImage
                image={image}
                ref={imageRef}
                width={imageSize.width}
                height={imageSize.height}
              />
              
              <Rect
                x={0}
                y={0}
                width={imageSize.width}
                height={imageSize.height}
                fill="black"
                opacity={0.6}
                listening={false}
              />
              
              <Rect
                x={cropArea.x}
                y={cropArea.y}
                width={cropArea.width}
                height={cropArea.height}
                fill="transparent"
                globalCompositeOperation="destination-out"
                listening={false}
              />
              
              <Rect
                ref={cropRef}
                x={cropArea.x}
                y={cropArea.y}
                width={cropArea.width}
                height={cropArea.height}
                stroke="#00ff00"
                strokeWidth={3}
                draggable
                onDragEnd={handleCropChange}
                onTransformEnd={handleCropChange}
                dragBoundFunc={(pos: any) => {
                  let newX = pos.x;
                  let newY = pos.y;
                  
                  if (newX < 0) newX = 0;
                  if (newY < 0) newY = 0;
                  if (newX + cropArea.width > imageSize.width) {
                    newX = imageSize.width - cropArea.width;
                  }
                  if (newY + cropArea.height > imageSize.height) {
                    newY = imageSize.height - cropArea.height;
                  }
                  
                  return { x: newX, y: newY };
                }}
              />
              
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox: any, newBox: any) => {
                  if (newBox.width < 50 || newBox.height < 50) {
                    return oldBox;
                  }
                  if (newBox.x < 0 || newBox.y < 0) {
                    return oldBox;
                  }
                  if (newBox.x + newBox.width > imageSize.width || 
                      newBox.y + newBox.height > imageSize.height) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>

        <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <p><strong>Crop Area:</strong></p>
          <p>Position: ({Math.round(cropArea.x)}, {Math.round(cropArea.y)})</p>
          <p>Size: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px</p>
        </div>
      </div>
    </div>
  );
};

export default CropClientPage;
