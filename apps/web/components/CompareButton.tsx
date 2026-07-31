"use client";

import { useState } from "react";
import type { Product } from "@/lib/api";
import { toCompareItem, useCompare } from "@/lib/compare";

type Props = {
  product: Pick<
    Product,
    | "id"
    | "slug"
    | "name"
    | "name_en"
    | "description"
    | "product_type"
    | "badge"
    | "price"
    | "unit"
    | "image_url"
    | "rating"
    | "review_count"
  >;
  variant?: "icon" | "button";
  className?: string;
};

export function CompareButton({
  product,
  variant = "icon",
  className = "",
}: Props) {
  const { has, toggle, max } = useCompare();
  const active = has(product.id);
  const [hint, setHint] = useState<string | null>(null);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = toggle(toCompareItem(product));
    if (result === "full") {
      setHint(`เปรียบเทียบได้สูงสุด ${max} รายการ`);
      window.setTimeout(() => setHint(null), 1800);
    } else {
      setHint(null);
    }
  }

  if (variant === "button") {
    return (
      <span className="relative inline-flex w-full flex-col items-stretch">
        <button
          type="button"
          onClick={handleClick}
          aria-pressed={active}
          className={
            className ||
            "inline-flex items-center justify-center rounded-xl border border-primary/20 px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
          }
        >
          <span className="inline-flex items-center gap-2">
            <span aria-hidden>⇄</span>
            {active ? "อยู่ในรายการเปรียบเทียบ" : "เปรียบเทียบ"}
          </span>
        </button>
        {hint ? (
          <span className="mt-1 text-xs text-red-600">{hint}</span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="relative">
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        className={
          className ||
          `flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-accent ${
            active ? "text-primary-light ring-2 ring-primary/30" : "text-primary"
          }`
        }
        aria-label={
          active ? "ลบออกจากเปรียบเทียบ" : "เพิ่มเพื่อเปรียบเทียบ"
        }
        title={active ? "ลบออกจากเปรียบเทียบ" : "เปรียบเทียบ"}
      >
        ⇄
      </button>
      {hint ? (
        <span className="absolute top-full right-0 z-20 mt-1 w-36 rounded-lg bg-primary px-2 py-1 text-[10px] leading-snug text-white shadow">
          {hint}
        </span>
      ) : null}
    </span>
  );
}
