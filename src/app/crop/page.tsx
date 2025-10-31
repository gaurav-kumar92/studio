
'use client';

import dynamic from 'next/dynamic';

const CropClientPage = dynamic(() => import('./CropClientPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-xl text-gray-600">Loading Cropper...</div>
    </div>
  ),
});

export default function CropPage() {
  return <CropClientPage />;
}
