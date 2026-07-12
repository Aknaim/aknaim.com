"use client";

import Image from "next/image";
import { useState } from "react";
import { AssetFallback, type AssetFallbackVariant } from "./AssetFallback";

export type { AssetFallbackVariant };

interface AssetImageProps {
  src: string;
  alt: string;
  icon?: string;
  forceFallback?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  fallbackMuted?: boolean;
  fallbackVariant?: AssetFallbackVariant;
  scrim?: boolean;
}

export function AssetImage({
  src,
  alt,
  icon,
  forceFallback = false,
  fill = true,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className = "",
  imageClassName = "object-cover",
  fallbackClassName = "",
  fallbackMuted = false,
  fallbackVariant = "default",
  scrim = false,
}: AssetImageProps) {
  const [loadFailed, setLoadFailed] = useState(forceFallback);

  const showFallback = loadFailed || forceFallback;

  if (showFallback) {
    return (
      <AssetFallback
        icon={icon}
        label={alt}
        className={fallbackClassName}
        muted={fallbackMuted}
        variant={fallbackVariant}
      />
    );
  }

  const imageNode = fill ? (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`${imageClassName} ${className}`.trim()}
      onError={() => setLoadFailed(true)}
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width ?? 48}
      height={height ?? 48}
      sizes={sizes}
      priority={priority}
      className={`${imageClassName} ${className}`.trim()}
      onError={() => setLoadFailed(true)}
    />
  );

  if (!scrim) {
    return imageNode;
  }

  return (
    <>
      {imageNode}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"
        aria-hidden
      />
    </>
  );
}
