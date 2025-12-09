"use client";

import { useCallback } from 'react';
import {
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

function Toolbar({ onLayoutVertical, onLayoutHorizontal, onZoomIn, onZoomOut, onFitView }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-md border-b border-neutral-200/50 flex items-center justify-between px-8 z-20 shadow-sm transition-all duration-300">
      {/* Left Section - Layout Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-neutral-100/50 rounded-lg p-1 backdrop-blur-sm">
          <button
            onClick={onLayoutVertical}
            className="p-2.5 text-neutral-600 hover:text-primary-600 hover:bg-white active:bg-neutral-200 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            title="Vertical Layout"
          >
            <ArrowsUpDownIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-neutral-300/30"></div>
          <button
            onClick={onLayoutHorizontal}
            className="p-2.5 text-neutral-600 hover:text-primary-600 hover:bg-white active:bg-neutral-200 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            title="Horizontal Layout"
          >
            <ArrowsRightLeftIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Section - Zoom & View Controls */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-neutral-100/50 rounded-lg p-1 backdrop-blur-sm">
          <button
            onClick={onZoomIn}
            className="p-2.5 text-neutral-600 hover:text-primary-600 hover:bg-white active:bg-neutral-200 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-neutral-300/30"></div>
          <button
            onClick={onZoomOut}
            className="p-2.5 text-neutral-600 hover:text-primary-600 hover:bg-white active:bg-neutral-200 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-neutral-300/30"></div>
          <button
            onClick={onFitView}
            className="p-2.5 text-neutral-600 hover:text-primary-600 hover:bg-white active:bg-neutral-200 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            title="Fit View"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
