"use client";

import { useEffect, useMemo, useState } from "react";
import { toPublicMediaUrl } from "@/lib/media";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const list = useMemo(
    () =>
      images
        .map((u) => toPublicMediaUrl(u))
        .filter((u) => typeof u === "string" && u.length > 0),
    [images],
  );
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setActive(0);
  }, [list.join("|")]);

  useEffect(() => {
    if (!lightbox) {
      setZoom(1);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % Math.max(list.length, 1));
      if (e.key === "ArrowLeft") {
        setActive((i) => (i - 1 + list.length) % Math.max(list.length, 1));
      }
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.25));
      if (e.key === "-") setZoom((z) => Math.max(1, z - 0.25));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, list.length]);

  if (!list.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl bg-accent-soft text-sm text-muted">
        ยังไม่มีรูปสินค้า
      </div>
    );
  }

  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-accent-soft text-left"
        aria-label="ขยายรูป"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={alt}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute right-4 bottom-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          คลิกเพื่อขยาย
        </span>
      </button>

      {list.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {list.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                index === active
                  ? "border-primary shadow-sm"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="text-sm">
              {active + 1} / {list.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              >
                −
              </button>
              <span className="min-w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              >
                +
              </button>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                onClick={() => setZoom(1)}
              >
                รีเซ็ต
              </button>
              <button
                type="button"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                onClick={() => setLightbox(false)}
              >
                ปิด ✕
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-auto p-4">
            {list.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-3 z-10 rounded-full bg-white/15 px-3 py-2 text-white hover:bg-white/25"
                  onClick={() =>
                    setActive((i) => (i - 1 + list.length) % list.length)
                  }
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute right-3 z-10 rounded-full bg-white/15 px-3 py-2 text-white hover:bg-white/25"
                  onClick={() => setActive((i) => (i + 1) % list.length)}
                >
                  ›
                </button>
              </>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current}
              alt={alt}
              className="max-h-[80vh] max-w-[92vw] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2))}
            />
          </div>

          {list.length > 1 ? (
            <div className="flex justify-center gap-2 px-4 pb-5">
              {list.map((url, index) => (
                <button
                  key={`lb-${url}-${index}`}
                  type="button"
                  onClick={() => {
                    setActive(index);
                    setZoom(1);
                  }}
                  className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${
                    index === active ? "border-accent" : "border-transparent opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
