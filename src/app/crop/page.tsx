'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useToast } from '@/hooks/use-toast';

const CropPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const cropperRef = useRef<any>(null);

  useEffect(() => {
    const url = localStorage.getItem('imageToCrop');
    if (url) {
      setImageUrl(url);
    } else {
      // If no image is found, redirect away.
      router.push('/');
    }
  }, [router]);

  const handleCrop = () => {
    if (cropperRef.current?.cropper) {
      // Get cropped canvas data
      const croppedDataURL = cropperRef.current.cropper.getCroppedCanvas().toDataURL();
      
      // Store it in localStorage for the main page to pick up
      localStorage.setItem('croppedImage', croppedDataURL);
      
      // Navigate back to the editor
      router.push('/');
    } else {
       toast({
        variant: "destructive",
        title: "Cropping Error",
        description: "Could not apply the crop. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    // Clear localStorage and go back
    localStorage.removeItem('imageToCrop');
    localStorage.removeItem('imageNodeToCrop');
    router.push('/');
  };

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading Image Cropper...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-5xl w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
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

        <div className="bg-gray-200 p-4 rounded-lg">
          <Cropper
            ref={cropperRef}
            src={imageUrl}
            style={{ height: '60vh', width: '100%' }}
            viewMode={1}
            dragMode="move"
            aspectRatio={NaN} // Free crop
            background={false}
            responsive={true}
            autoCropArea={0.8}
            checkOrientation={false}
            guides={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CropPage;
