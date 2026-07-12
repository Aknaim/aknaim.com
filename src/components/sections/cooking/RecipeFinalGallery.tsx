"use client";

import Image from "next/image";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useImageLightbox } from "@/hooks/useImageLightbox";
import type { LightboxImage } from "@/lib/types/lightbox";

interface RecipeFinalGalleryProps {
  images: { src: string; alt: string }[];
  recipeTitle: string;
}

export function RecipeFinalGallery({ images, recipeTitle }: RecipeFinalGalleryProps) {
  const { activeIndex, isOpen, open, close, setActiveIndex } = useImageLightbox();

  const lightboxImages: LightboxImage[] = images.map((img, index) => ({
    id: `final-${index}`,
    src: img.src,
    alt: img.alt,
    title: recipeTitle,
    subtitle: "Final Result",
  }));

  return (
    <section className="space-y-6">
      <div className="border-b border-[#141414] pb-3">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          Final Result
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((photo, index) => (
          <button
            key={photo.src + index}
            type="button"
            onClick={() => open(index)}
            className="relative aspect-square overflow-hidden rounded-image border border-[#141414] bg-[#0c0c0c] hover:border-[#262626] transition-colors cursor-zoom-in group"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>

      <ImageLightbox
        images={lightboxImages}
        activeIndex={isOpen ? activeIndex : null}
        onClose={close}
        onIndexChange={setActiveIndex}
      />
    </section>
  );
}
