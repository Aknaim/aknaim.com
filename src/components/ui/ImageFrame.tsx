import { AssetImage } from "./AssetImage";
import type { AssetFallbackVariant } from "./AssetFallback";

interface ImageFrameProps {
  src: string;
  alt: string;
  icon?: string;
  forceFallback?: boolean;
  priority?: boolean;
  className?: string;
  scrim?: boolean;
  fallbackVariant?: AssetFallbackVariant;
}

export function ImageFrame({
  src,
  alt,
  icon,
  forceFallback = false,
  priority = false,
  className = "",
  scrim = true,
  fallbackVariant = "panel",
}: ImageFrameProps) {
  return (
    <figure
      className={`relative overflow-hidden rounded-image border border-[#262626] bg-surface ${className} ${
        forceFallback ? "image-frame--fallback" : ""
      }`}
    >
      <AssetImage
        src={src}
        alt={alt}
        icon={icon}
        forceFallback={forceFallback}
        priority={priority}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        scrim={scrim && !forceFallback}
        fallbackVariant={fallbackVariant}
      />
    </figure>
  );
}
