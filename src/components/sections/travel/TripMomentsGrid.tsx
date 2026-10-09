"use client";

import Image from "next/image";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useImageLightbox } from "@/hooks/useImageLightbox";
import type { GalleryMoment } from "@/lib/types/travel";
import type { LightboxImage } from "@/lib/types/lightbox";

export function TripMomentsGrid({
  moments,
  country,
}: {
  moments: GalleryMoment[];
  country: string;
}) {
  const { activeIndex, isOpen, open, close, setActiveIndex } = useImageLightbox();

  const lightboxImages: LightboxImage[] = moments.map((moment, index) => ({
    id: `moment-${index}-${moment.title}`,
    src: moment.imageSrc,
    alt: moment.title,
    title: moment.title,
    subtitle: country,
  }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {moments.map((moment, index) => (
          <button
            key={`${moment.title}-${index}`}
            type="button"
            onClick={() => open(index)}
            aria-label={`View ${moment.title}`}
            className="relative aspect-[4/3] rounded border border-[#2a2620] bg-[#141210] overflow-hidden group text-left cursor-zoom-in hover:border-[#3a3530] transition-colors"
          >
            <Image
              src={moment.imageSrc}
              alt={moment.title}
              fill
              className="object-cover transition-transform duration-500 scale-100 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 p-4 flex items-end bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none">
              <span className="text-xs text-white font-medium tracking-wide drop-shadow-sm">
                {moment.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      <ImageLightbox
        images={lightboxImages}
        activeIndex={isOpen ? activeIndex : null}
        onClose={close}
        onIndexChange={setActiveIndex}
      />
    </>
  );
}
