
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client-side component with SSR disabled
const DynamicCropPage = dynamic(() => import('./CropClientPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-xl text-gray-600">Loading Cropper...</div>
    </div>
  ),
});

export default function Page() {
  return <DynamicCropPage />;
}
