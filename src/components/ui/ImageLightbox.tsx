"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { LightboxImage } from "@/lib/types/lightbox";

interface ImageLightboxProps {
  images: LightboxImage[];
  activeIndex: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ImageLightbox({
  images,
  activeIndex,
  onClose,
  onIndexChange,
}: ImageLightboxProps) {
  const isOpen = activeIndex !== null && images.length > 0;
  const current = isOpen ? images[activeIndex] : null;
  const hasPrev = isOpen && activeIndex > 0;
  const hasNext = isOpen && activeIndex < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev && activeIndex !== null) onIndexChange(activeIndex - 1);
  }, [activeIndex, hasPrev, onIndexChange]);

  const goNext = useCallback(() => {
    if (hasNext && activeIndex !== null) onIndexChange(activeIndex + 1);
  }, [activeIndex, hasNext, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "ArrowRight":
          goNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen || !current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={current.title ?? current.alt}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close lightbox"
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/80 hover:text-white hover:border-white/25 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 md:left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/80 hover:text-white hover:border-white/25 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 md:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/80 hover:text-white hover:border-white/25 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center max-w-[95vw] max-h-[90vh] px-14 md:px-20">
        <div className="relative w-[min(95vw,1200px)] h-[min(80vh,800px)]">
          <Image
            key={current.id}
            src={current.src}
            alt={current.alt}
            fill
            className="object-contain"
            sizes="95vw"
            priority
          />
        </div>

        <div className="mt-4 text-center space-y-2">
          {current.title && (
            <p className="font-display text-lg text-white tracking-wide">{current.title}</p>
          )}
          {current.subtitle && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
              {current.subtitle}
            </p>
          )}
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground-subtle">
            {(activeIndex ?? 0) + 1} / {images.length}
          </p>
          {current.href && (
            <Link
              href={current.href}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent hover:text-accent-hover transition-colors pointer-events-auto mt-2 group"
            >
              View Recipe
              <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
