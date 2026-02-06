'use client';

import dynamic from 'next/dynamic';

// Dynamically import TldrawCanvas with no SSR to prevent bundling issues
const TldrawCanvas = dynamic(() => import('./TldrawCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading canvas...</p>
      </div>
    </div>
  ),
});

export default TldrawCanvas;
