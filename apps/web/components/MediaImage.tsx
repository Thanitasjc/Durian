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
 * Use plain <img> for Laravel /storage files (Next image optimizer blocks 127.0.0.1).
 * Use next/image for remote CDNs (e.g. Unsplash).
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

  if (isLocalStorageUrl(url) || url.startsWith("/")) {
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
