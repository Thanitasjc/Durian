"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/api";

type Props = {
  products: Product[];
  autoplayMs?: number;
};

function useVisibleCount() {
  const [count, setCount] = useState(4);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setCount(1);
      else if (w < 1024) setCount(2);
      else setCount(4);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

/**
 * แสดง 4 ชิ้นต่อแถว (desktop) แล้วเลื่อนทีละชิ้น
 * ใช้ native scroll-snap ให้กดลูกศร / ลาก / autoplay ได้จริง
 */
export function FeaturedProductsSlider({
  products,
  autoplayMs = 4500,
}: Props) {
  const visible = useVisibleCount();
  const canSlide = products.length > visible;
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const maxIndex = Math.max(0, products.length - visible);

  const scrollToIndex = useCallback((next: number) => {
    const el = scrollerRef.current;
    if (!el || !el.children.length) return;
    const clamped = Math.max(0, Math.min(next, products.length - 1));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    setIndex(Math.max(0, Math.min(clamped, maxIndex)));
  }, [maxIndex, products.length]);

  const prev = useCallback(() => {
    scrollToIndex(Math.max(0, index - 1));
  }, [index, scrollToIndex]);

  const next = useCallback(() => {
    const target = index >= maxIndex ? 0 : index + 1;
    scrollToIndex(target);
  }, [index, maxIndex, scrollToIndex]);

  // Sync index from scroll position
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const children = Array.from(el.children) as HTMLElement[];
        if (!children.length) return;
        const left = el.scrollLeft;
        let best = 0;
        let bestDist = Infinity;
        children.forEach((child, i) => {
          const dist = Math.abs(child.offsetLeft - left);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        setIndex(Math.max(0, Math.min(best, maxIndex)));
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    if (!canSlide || paused || autoplayMs <= 0) return;
    const id = window.setInterval(() => {
      setIndex((current) => {
        const target = current >= maxIndex ? 0 : current + 1;
        const el = scrollerRef.current;
        const child = el?.children[target] as HTMLElement | undefined;
        if (el && child) {
          el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
        }
        return target;
      });
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [canSlide, paused, autoplayMs, maxIndex]);

  if (!products.length) {
    return (
      <p className="mt-12 text-center text-muted">
        ยังไม่มีสินค้า — เพิ่มได้ที่ Admin → สินค้า (เปิด “แสดงในสินค้าแนะนำ”)
      </p>
    );
  }

  return (
    <div
      className="relative mt-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {canSlide ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="ก่อนหน้า"
            className="absolute top-1/2 -left-2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-primary shadow-md transition hover:bg-accent md:-left-5"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="ถัดไป"
            className="absolute top-1/2 -right-2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-primary shadow-md transition hover:bg-accent md:-right-5"
          >
            ›
          </button>
        </>
      ) : null}

      <ul
        ref={scrollerRef}
        className={`flex list-none gap-0 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          canSlide ? "cursor-grab active:cursor-grabbing snap-x snap-mandatory" : ""
        }`}
      >
        {products.map((product) => (
          <li
            key={product.id}
            className="shrink-0 snap-start select-none px-2 sm:px-3"
            style={{
              width: `${100 / visible}%`,
            }}
          >
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      {canSlide ? (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`ไปหน้า ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition ${
                i === index
                  ? "w-6 bg-primary"
                  : "w-2 bg-primary/25 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
