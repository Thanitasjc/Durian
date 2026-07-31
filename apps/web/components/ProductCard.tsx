"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CompareButton } from "@/components/CompareButton";
import { MediaImage } from "@/components/MediaImage";
import { WishlistButton } from "@/components/WishlistButton";
import { formatPrice, type Product } from "@/lib/api";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-black/5 bg-surface shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft">
        {product.image_url ? (
          <MediaImage
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
        {product.badge ? (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-[10px] font-bold text-primary">
            {product.badge}
          </span>
        ) : null}

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/products/${product.slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow"
            aria-label="ดูรายละเอียด"
            title="ดูรายละเอียด"
          >
            👁
          </Link>
          <AddToCartButton product={product} />
          <WishlistButton product={product} />
          <CompareButton product={product} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-primary">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-primary-light"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">
          {product.description}
        </p>
        <p className="mt-3 text-sm font-semibold text-primary-light">
          {formatPrice(product.price, product.unit)}
        </p>
      </div>
    </div>
  );
}
