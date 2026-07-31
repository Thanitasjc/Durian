"use client";

import type { Product } from "@/lib/api";
import { useWishlist } from "@/lib/wishlist";

type Props = {
  product: Pick<
    Product,
    "id" | "slug" | "name" | "price" | "unit" | "image_url"
  >;
  variant?: "icon" | "button";
  className?: string;
};

export function WishlistButton({
  product,
  variant = "icon",
  className = "",
}: Props) {
  const { has, toggle } = useWishlist();
  const active = has(product.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image_url: product.image_url,
    });
  }

  if (variant === "button") {
    return (
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
          <span aria-hidden>{active ? "♥" : "♡"}</span>
          {active ? "อยู่ในรายการถูกใจ" : "เพิ่มในรายการถูกใจ"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className={
        className ||
        `flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-accent ${
          active ? "text-red-500" : "text-primary"
        }`
      }
      aria-label={active ? "ลบออกจากรายการถูกใจ" : "เพิ่มในรายการถูกใจ"}
      title={active ? "ลบออกจากรายการถูกใจ" : "ถูกใจ"}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
