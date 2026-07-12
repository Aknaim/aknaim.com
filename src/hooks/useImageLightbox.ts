"use client";

import { useCallback, useState } from "react";

export function useImageLightbox() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const close = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return {
    activeIndex,
    isOpen: activeIndex !== null,
    open,
    close,
    setActiveIndex,
  };
}
