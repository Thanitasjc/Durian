"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/api";

type Props = {
  product: Pick<
    Product,
    "id" | "slug" | "name" | "price" | "unit" | "image_url"
  >;
  variant?: "icon" | "button";
  className?: string;
};

export function AddToCartButton({
  product,
  variant = "icon",
  className = "",
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image_url: product.image_url,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={
          className ||
          "inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary-light"
        }
      >
        {added ? "เพิ่มแล้ว ✓" : "เพิ่มลงตะกร้า"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow transition hover:bg-accent"
      }
      aria-label={added ? "เพิ่มลงตะกร้าแล้ว" : "เพิ่มลงตะกร้า"}
      title={added ? "เพิ่มแล้ว" : "เพิ่มลงตะกร้า"}
    >
      {added ? "✓" : "🛒"}
    </button>
  );
}
