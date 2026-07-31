"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/api";

type Props = {
  products: Product[];
  /** Auto-advance interval in ms; 0 disables. Default 4500. */
  autoplayMs?: number;
};

function usePreferredVisible() {
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

export function FeaturedProductsSlider({
  products,
  autoplayMs = 4500,
}: Props) {
  const preferredVisible = usePreferredVisible();
  const visible = Math.min(preferredVisible, Math.max(products.length, 1));
  // Slide whenever there is more than one product (infinite loop),
  // even if the viewport already shows all of them.
  const canSlide = products.length > 1;
  const slidePct = 100 / visible;

  const track = useMemo(() => {
    if (!products.length) return [];
    if (!canSlide) return products;
    return [
      ...products.slice(-visible),
      ...products,
      ...products.slice(0, visible),
    ];
  }, [products, visible, canSlide]);

  const [pos, setPos] = useState(canSlide ? visible : 0);
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startDrag = useRef(0);
  const didDrag = useRef(false);
  const posRef = useRef(pos);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    setAnimate(false);
    setPos(canSlide ? visible : 0);
    setDragPx(0);
    const t = window.setTimeout(() => setAnimate(true), 30);
    return () => window.clearTimeout(t);
  }, [visible, products.length, canSlide]);

  const goTo = useCallback(
    (delta: number) => {
      if (!canSlide || dragging.current) return;
      setAnimate(true);
      setPos((p) => p + delta);
    },
    [canSlide],
  );

  const prev = useCallback(() => goTo(-1), [goTo]);
  const next = useCallback(() => goTo(1), [goTo]);

  // Autoplay
  useEffect(() => {
    if (!canSlide || paused || autoplayMs <= 0) return;
    const id = window.setInterval(() => {
      if (dragging.current) return;
      setAnimate(true);
      setPos((p) => p + 1);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [canSlide, paused, autoplayMs]);

  const onTransitionEnd = useCallback(() => {
    if (!canSlide || dragging.current) return;
    const p = posRef.current;
    const n = products.length;
    if (p >= n + visible) {
      setAnimate(false);
      setPos(visible + (p - (n + visible)));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    } else if (p < visible) {
      setAnimate(false);
      setPos(n + p);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    }
  }, [canSlide, products.length, visible]);

  const logicalIndex = canSlide
    ? ((pos - visible) % products.length + products.length) % products.length
    : 0;

  function clientX(e: React.PointerEvent | PointerEvent) {
    return e.clientX;
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canSlide) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input")) return;

    dragging.current = true;
    didDrag.current = false;
    startX.current = clientX(e);
    startDrag.current = dragPx;
    setAnimate(false);
    setPaused(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = clientX(e) - startX.current;
    if (Math.abs(dx) > 6) didDrag.current = true;
    setDragPx(startDrag.current + dx);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const width = viewportRef.current?.offsetWidth ?? 1;
    const slideWidth = width / visible;
    const steps = Math.round(-dragPx / slideWidth);

    setAnimate(true);
    setDragPx(0);
    setPaused(false);

    if (steps !== 0) {
      setPos((p) => p + steps);
    } else {
      setPos((p) => p);
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
  };

  if (!products.length) {
    return (
      <p className="mt-12 text-center text-muted">
        ยังไม่มีสินค้า — เพิ่มได้ที่ Admin → สินค้า (เปิด “แสดงในสินค้าแนะนำ”)
      </p>
    );
  }

  const translatePct = pos * slidePct;

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
            className="absolute top-1/2 -left-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-primary shadow-md transition hover:bg-accent md:-left-5"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="ถัดไป"
            className="absolute top-1/2 -right-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-primary shadow-md transition hover:bg-accent md:-right-5"
          >
            ›
          </button>
        </>
      ) : null}

      <div
        ref={viewportRef}
        className="overflow-hidden touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        <ul
          className={`flex list-none ${animate ? "transition-transform duration-500 ease-out" : ""} ${
            canSlide ? "cursor-grab active:cursor-grabbing" : ""
          }`}
          style={{
            transform: `translateX(calc(-${translatePct}% + ${dragPx}px))`,
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {track.map((product, i) => (
            <li
              key={`${product.id}-${i}`}
              className="shrink-0 select-none px-2 sm:px-3"
              style={{ width: `${slidePct}%` }}
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>

      {canSlide ? (
        <div className="mt-6 flex justify-center gap-2">
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`ไปสินค้า ${i + 1}`}
              onClick={() => {
                setAnimate(true);
                setPos(visible + i);
              }}
              className={`h-2 rounded-full transition ${
                i === logicalIndex
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
