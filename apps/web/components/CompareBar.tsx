"use client";

import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { useCompare } from "@/lib/compare";

export function CompareBar() {
  const { items, count, max, remove, clear } = useCompare();

  if (count < 1) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-black/10 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-3 md:px-8">
        <p className="text-sm font-semibold text-primary">
          เปรียบเทียบ{" "}
          <span className="text-primary-light">
            {count}/{max}
          </span>
        </p>

        <ul className="flex flex-1 flex-wrap items-center gap-2">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center gap-2 rounded-full border border-black/5 bg-[#f6f3ee] py-1 pr-2 pl-1"
            >
              <span className="relative h-8 w-8 overflow-hidden rounded-full bg-accent-soft">
                {item.image_url ? (
                  <MediaImage
                    src={item.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                ) : null}
              </span>
              <span className="max-w-[9rem] truncate text-xs font-medium text-primary">
                {item.name}
              </span>
              <button
                type="button"
                onClick={() => remove(item.productId)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-white hover:text-primary"
                aria-label={`ลบ ${item.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="rounded-lg px-3 py-2 text-xs text-muted hover:bg-black/5"
          >
            ล้าง
          </button>
          <Link
            href="/compare"
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition ${
              count >= 2
                ? "bg-primary hover:bg-primary-light"
                : "pointer-events-none bg-primary/40"
            }`}
          >
            ดูการเปรียบเทียบ
          </Link>
        </div>
      </div>
    </div>
  );
}
