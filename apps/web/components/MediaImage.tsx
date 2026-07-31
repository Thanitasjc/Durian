"use client";

import Image from "next/image";
import { isLocalStorageUrl, toPublicMediaUrl } from "@/lib/media";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  draggable?: boolean;
};

/**
 * Use plain <img> for Laravel /storage/uploads files.
 * Use next/image for remote CDNs (Supabase / Unsplash).
 */
export function MediaImage({
  src,
  alt,
  className,
  fill,
  sizes,
  priority,
  draggable,
}: Props) {
  const url = toPublicMediaUrl(src);
  if (!url) return null;

  // Absolute http(s) or expanded Supabase → next/image
  // Only bare Laravel /storage/uploads → plain img via rewrite
  const usePlainImg =
    isLocalStorageUrl(url) &&
    !url.startsWith("http") &&
    !url.includes("/storage/v1/");

  if (usePlainImg) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          className={className}
          draggable={draggable}
          sizes={sizes}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        className={className}
        draggable={draggable}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      priority={priority}
      draggable={draggable}
    />
  );
}
