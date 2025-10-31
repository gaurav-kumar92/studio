'use client';

import React, { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { useRouter } from 'next/navigation';

export default function CropPage() {
  const router = useRouter();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const imageToCrop = localStorage.getItem('imageToCrop');
    if (imageToCrop) {
      setImageUrl(imageToCrop);
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (imageUrl && imgRef.current) {
      const cropperInstance = new Cropper(imgRef.current, {
        aspectRatio: NaN, // free crop
        viewMode: 1,
        autoCropArea: 1,
        background: false,
        responsive: true,
        crop: () => {
          if (previewRef.current && cropperInstance) {
            const previewCanvas = cropperInstance.getCroppedCanvas({
              width: 200,
              height: 200,
            });
            if(previewCanvas) {
                previewRef.current.src = previewCanvas.toDataURL('image/png');
            }
          }
        },
      });
      setCropper(cropperInstance);

      return () => {
        cropperInstance.destroy();
      };
    }
  }, [imageUrl]);

  const handleDone = () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas();
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      localStorage.setItem('croppedImage', dataUrl);
      // Dispatch a storage event to notify the other tab/page
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'croppedImage',
          newValue: dataUrl,
        })
      );
      router.back();
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('imageToCrop');
    localStorage.removeItem('croppedImage');
    localStorage.removeItem('imageNodeToCrop');
    router.back();
  };

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading Image...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Crop Image</h1>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Crop area */}
          <div className="flex-1 bg-gray-200 p-2 rounded-md">
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop Target"
              className="max-w-full block"
              style={{ maxHeight: '60vh' }}
            />
          </div>

          {/* Preview area */}
          <div className="flex flex-col items-center justify-center p-4 border rounded-md">
            <p className="font-semibold mb-2">Preview</p>
            <div className="w-[200px] h-[200px] bg-gray-100 overflow-hidden rounded-md shadow-inner">
                 <img
                    ref={previewRef}
                    alt="Cropped Preview"
                    className="w-full h-full"
                    style={{ objectFit: 'contain' }}
                />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleDone}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Apply Crop
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
