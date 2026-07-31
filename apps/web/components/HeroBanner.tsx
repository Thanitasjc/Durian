"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HeroSlide as ApiHeroSlide, SiteSection } from "@/lib/api";
import { toPublicMediaUrl } from "@/lib/media";

export type HeroSlide = {
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  eyebrow?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  cta_label?: string | null;
  cta_link?: string | null;
  cta_label_2?: string | null;
  cta_link_2?: string | null;
};

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.replace("/", "");
    } else if (u.hostname.includes("youtube.com")) {
      id = u.searchParams.get("v") || "";
      if (!id && u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] || "";
      }
      if (!id && u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] || "";
      }
    }
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0`;
  } catch {
    return null;
  }
}

function vimeoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("vimeo.com")) return null;
    const id = u.pathname.split("/").filter(Boolean).pop();
    if (!id || !/^\d+$/.test(id)) return null;
    return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function normalizeSlides(
  slides: ApiHeroSlide[] | undefined,
  hero: SiteSection | null,
): HeroSlide[] {
  const fromApi = (slides ?? []).filter(
    (s) =>
      s &&
      ((typeof s.image_url === "string" && s.image_url) ||
        (typeof s.video_url === "string" && s.video_url)),
  );

  if (fromApi.length > 0) {
    return fromApi.map((s) => ({
      title: s.title,
      subtitle: s.subtitle,
      body: s.body,
      eyebrow: s.eyebrow,
      image_url: s.image_url ? toPublicMediaUrl(s.image_url) : s.image_url,
      video_url: s.video_url ? toPublicMediaUrl(s.video_url) : s.video_url,
      cta_label: s.cta_label,
      cta_link: s.cta_link,
      cta_label_2: s.cta_label_2,
      cta_link_2: s.cta_link_2,
    }));
  }

  if (hero?.image_url || hero?.title) {
    return [
      {
        title: hero.title || "AuraGold Durian",
        subtitle: hero.subtitle,
        body: hero.body,
        eyebrow: hero.eyebrow,
        image_url: hero.image_url
          ? toPublicMediaUrl(hero.image_url)
          : "https://images.unsplash.com/photo-1595475207225-428b62bda831?w=1920&q=80",
        cta_label: hero.cta_label,
        cta_link: hero.cta_link,
        cta_label_2: hero.cta_label_2,
        cta_link_2: hero.cta_link_2,
      },
    ];
  }

  return [];
}

function SlideMedia({
  slide,
  active,
}: {
  slide: HeroSlide;
  active: boolean;
}) {
  const videoUrl = slide.video_url?.trim() || "";
  const yt = videoUrl ? youtubeEmbedUrl(videoUrl) : null;
  const vimeo = videoUrl ? vimeoEmbedUrl(videoUrl) : null;
  const direct = videoUrl && isDirectVideo(videoUrl) ? videoUrl : null;
  const embed = yt || vimeo;

  if (embed) {
    return (
      <div className="relative aspect-[16/9] max-h-[min(85vh,820px)] w-full overflow-hidden bg-slate-900 md:aspect-[21/9]">
        <div className="absolute inset-0 overflow-hidden">
          {active ? (
            <iframe
              title={slide.title || "Hero video"}
              src={embed}
              className="pointer-events-none absolute top-1/2 left-1/2 h-[56.25vw] min-h-[120%] w-[177.78vh] min-w-[120%] -translate-x-1/2 -translate-y-1/2 scale-[1.25] border-0 md:scale-[1.35]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex={-1}
            />
          ) : slide.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.image_url}
              alt={slide.title || "Hero banner"}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900" />
          )}
        </div>
      </div>
    );
  }

  if (direct) {
    return (
      <div className="relative aspect-[16/9] max-h-[min(85vh,820px)] w-full overflow-hidden bg-slate-900 md:aspect-[21/9]">
        {active ? (
          <video
            key={direct}
            src={direct}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={slide.image_url || undefined}
          />
        ) : slide.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.image_url}
            alt={slide.title || "Hero banner"}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : null}
      </div>
    );
  }

  if (slide.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={slide.image_url}
        alt={slide.title || "Hero banner"}
        className="block h-auto max-h-[min(85vh,820px)] w-full max-w-full object-cover"
        draggable={false}
      />
    );
  }

  return (
    <div className="aspect-[16/9] max-h-[min(85vh,820px)] w-full bg-slate-900" />
  );
}

type Props = {
  slides?: ApiHeroSlide[];
  hero?: SiteSection | null;
  intervalMs?: number;
};

export function HeroBanner({
  slides,
  hero = null,
  intervalMs = 6000,
}: Props) {
  const list = useMemo(() => normalizeSlides(slides, hero), [slides, hero]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const activeHasVideo = Boolean(list[index]?.video_url);

  const go = useCallback(
    (next: number) => {
      const len = list.length;
      if (len < 1) return;
      setIndex(((next % len) + len) % len);
    },
    [list.length],
  );

  useEffect(() => {
    if (paused || list.length < 2 || activeHasVideo) return;
    const id = window.setInterval(() => go(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [activeHasVideo, go, index, intervalMs, list.length, paused]);

  if (!list.length) {
    return null;
  }

  return (
    <section
      id="hero"
      className="group relative w-full overflow-hidden bg-primary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {list.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={`${slide.image_url || ""}-${slide.video_url || ""}-${i}`}
            className={`w-full transition-opacity duration-500 ease-out ${
              active
                ? "relative z-10 opacity-100"
                : "pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0"
            }`}
            aria-hidden={!active}
          >
            <div className="relative w-full">
              <SlideMedia slide={slide} active={active} />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/35 to-transparent" />
              <div className="absolute inset-0 z-20 flex flex-col items-start justify-center gap-3 px-5 py-10 text-left md:gap-4 md:px-12 md:py-12 lg:px-20">
                <div className="w-full max-w-7xl">
                  {slide.eyebrow ? (
                    <span className="inline-block rounded-full bg-accent px-4 py-1 text-xs font-bold text-primary">
                      {slide.eyebrow}
                    </span>
                  ) : null}
                  {slide.title || slide.subtitle ? (
                    <h1 className="font-heading mt-4 max-w-2xl text-3xl font-bold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:text-5xl lg:text-6xl">
                      {slide.title}
                      {slide.subtitle ? (
                        <>
                          {slide.title ? <br /> : null}
                          <span className="text-accent">{slide.subtitle}</span>
                        </>
                      ) : null}
                    </h1>
                  ) : null}
                  {slide.body ? (
                    <p className="mt-3 max-w-xl text-sm text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] md:mt-4 md:text-lg">
                      {slide.body}
                    </p>
                  ) : null}
                  {(slide.cta_label && slide.cta_link) ||
                  (slide.cta_label_2 && slide.cta_link_2) ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {slide.cta_label && slide.cta_link ? (
                        <Link
                          href={slide.cta_link}
                          className="rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-primary transition hover:opacity-90 md:px-6 md:py-3"
                        >
                          {slide.cta_label}
                        </Link>
                      ) : null}
                      {slide.cta_label_2 && slide.cta_link_2 ? (
                        <Link
                          href={slide.cta_link_2}
                          className="rounded-md border border-white/80 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 md:px-6 md:py-3"
                        >
                          {slide.cta_label_2}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {list.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => go(i)}
                className={`pointer-events-auto h-2.5 w-2.5 rounded-full shadow transition ${
                  i === index
                    ? "bg-white"
                    : "bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-3 z-30 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-primary shadow transition hover:bg-white md:left-6 md:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-3 z-30 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-primary shadow transition hover:bg-white md:right-6 md:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      ) : null}
    </section>
  );
}
