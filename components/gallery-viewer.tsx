'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function GalleryViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title
}: GalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md animate-in fade-in"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 sm:p-6 text-white z-10">
        <div>
          {title && <h4 className="text-sm font-semibold tracking-wide text-white/90">{title}</h4>}
          <span className="text-xs text-white/60">
            Photo {currentIndex + 1} of {images.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Close Gallery"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-xs"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Current Image */}
        <div className="relative w-full max-w-5xl h-[65vh] flex items-center justify-center">
          <Image
            src={images[currentIndex]}
            alt={title ? `${title} photo ${currentIndex + 1}` : `Gallery photo ${currentIndex + 1}`}
            fill
            className="object-contain transition-opacity duration-300"
            priority
          />
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 sm:right-8 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-xs"
          aria-label="Next Photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="p-4 sm:p-6 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
        {images.map((img, idx) => (
          <button
            key={img + idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              'relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer opacity-50 hover:opacity-100',
              idx === currentIndex ? 'border-wine-500 opacity-100 scale-105' : 'border-transparent'
            )}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
