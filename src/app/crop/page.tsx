
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const CropPage = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const cropperRef = useRef<any>(null);

  useEffect(() => {
    const imageUrl = localStorage.getItem('imageToCrop');
    if (imageUrl) {
      setImage(imageUrl);
    } else {
      console.error('No image URL found in localStorage.');
      // Optionally, redirect back if no image is found
      // router.push('/');
    }
  }, []);

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      if (croppedCanvas) {
        localStorage.setItem('croppedImage', croppedCanvas.toDataURL());
        router.push('/');
      }
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('imageToCrop');
    localStorage.removeItem('croppedImage');
    router.push('/');
  };

  if (!image) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p>Loading Image...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Crop Image</h1>
        <div style={{ width: '100%', height: '60vh', marginBottom: '1rem' }}>
          <Cropper
            ref={cropperRef}
            src={image}
            style={{ height: '100%', width: '100%' }}
            // Cropper.js options
            aspectRatio={1}
            guides={false}
            viewMode={1}
            dragMode="move"
            responsive={true}
            autoCropArea={0.8}
            checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
          />
        </div>
        <div className="flex gap-4">
          <Button onClick={handleCrop}>Apply Crop</Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CropPage;
