export interface LightboxImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
  mediaType?: "image" | "video";
  posterSrc?: string;
}
