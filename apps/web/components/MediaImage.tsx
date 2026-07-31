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
 * Supabase & local disk → plain <img>.
 * Other remotes (Unsplash) → next/image.
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

  const usePlainImg =
    isLocalStorageUrl(url) ||
    url.includes(".supabase.co/") ||
    url.startsWith("/storage/");

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
