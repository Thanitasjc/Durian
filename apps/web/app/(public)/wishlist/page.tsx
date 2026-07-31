"use client";

import Link from "next/link";
import { MediaImage } from "@/components/MediaImage";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistPage() {
  const { items, remove, clear, count } = useWishlist();
  const { addItem } = useCart();

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        รายการถูกใจ
      </h1>
      <p className="mt-2 text-sm text-muted">{count} รายการ</p>

      {!items.length ? (
        <div className="mt-12 rounded-3xl border border-dashed border-black/10 bg-surface p-10 text-center">
          <p className="text-muted">ยังไม่มีสินค้าในรายการถูกใจ</p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light"
          >
            เลือกสินค้า
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 space-y-4">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-accent-soft"
                >
                  {item.image_url ? (
                    <MediaImage
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-heading font-semibold text-primary hover:text-primary-light"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-primary-light">
                    {formatPrice(item.price, item.unit)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          productId: item.productId,
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          unit: item.unit,
                          image_url: item.image_url,
                        })
                      }
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-light"
                    >
                      เพิ่มลงตะกร้า
                    </button>
                    <Link
                      href={`/contact?product=${encodeURIComponent(item.slug)}`}
                      className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
                    >
                      สอบถาม
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="text-xs text-muted underline hover:text-primary"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-6">
            <Link
              href="/products"
              className="text-sm text-primary-light hover:underline"
            >
              ← เลือกสินค้าต่อ
            </Link>
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm text-muted hover:bg-black/5"
            >
              ล้างรายการถูกใจ
            </button>
          </div>
        </>
      )}
    </main>
  );
}
