"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MediaImage } from "@/components/MediaImage";
import { formatPrice, productTypeLabel } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { COMPARE_MAX, useCompare } from "@/lib/compare";

export default function ComparePage() {
  const { items, remove, clear, count } = useCompare();
  const { addItem } = useCart();

  const rows: {
    label: string;
    get: (item: (typeof items)[number]) => ReactNode;
  }[] = [
    {
      label: "ราคา",
      get: (item) => formatPrice(item.price, item.unit),
    },
    {
      label: "หมวดหมู่",
      get: (item) =>
        productTypeLabel[item.product_type] ?? item.product_type,
    },
    {
      label: "ป้ายกำกับ",
      get: (item) => item.badge || "—",
    },
    {
      label: "คะแนน",
      get: (item) => `★ ${item.rating} (${item.review_count} รีวิว)`,
    },
    {
      label: "ชื่อภาษาอังกฤษ",
      get: (item) => item.name_en || "—",
    },
    {
      label: "รายละเอียด",
      get: (item) => (
        <span className="line-clamp-4 text-left text-sm leading-relaxed text-muted">
          {item.description || "—"}
        </span>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            เปรียบเทียบสินค้า
          </h1>
          <p className="mt-2 text-sm text-muted">
            {count} / {COMPARE_MAX} รายการ
          </p>
        </div>
        {count > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-xl border border-black/10 px-4 py-2.5 text-sm text-muted hover:bg-black/5"
          >
            ล้างทั้งหมด
          </button>
        ) : null}
      </div>

      {!items.length ? (
        <div className="mt-12 rounded-3xl border border-dashed border-black/10 bg-surface p-10 text-center">
          <p className="text-muted">
            ยังไม่มีสินค้าในรายการเปรียบเทียบ
          </p>
          <p className="mt-2 text-sm text-muted">
            กดปุ่ม ⇄ บนสินค้าเพื่อเพิ่ม (สูงสุด {COMPARE_MAX} รายการ)
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light"
          >
            เลือกสินค้า
          </Link>
        </div>
      ) : count === 1 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-black/10 bg-surface p-10 text-center">
          <p className="text-muted">
            เพิ่มอีกอย่างน้อย 1 รายการเพื่อเปรียบเทียบ
          </p>
          <div className="mx-auto mt-8 max-w-xs">
            <ProductColumn
              item={items[0]}
              onRemove={() => remove(items[0].productId)}
              onAddCart={() =>
                addItem({
                  productId: items[0].productId,
                  slug: items[0].slug,
                  name: items[0].name,
                  price: items[0].price,
                  unit: items[0].unit,
                  image_url: items[0].image_url,
                })
              }
            />
          </div>
          <Link
            href="/products"
            className="mt-8 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light"
          >
            เลือกสินค้าเพิ่ม
          </Link>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/5">
                <th className="sticky left-0 z-10 w-36 bg-[#f6f3ee] px-4 py-4 text-left font-semibold text-primary">
                  คุณสมบัติ
                </th>
                {items.map((item) => (
                  <th
                    key={item.productId}
                    className="min-w-[180px] px-4 py-4 align-top"
                  >
                    <ProductColumn
                      item={item}
                      onRemove={() => remove(item.productId)}
                      onAddCart={() =>
                        addItem({
                          productId: item.productId,
                          slug: item.slug,
                          name: item.name,
                          price: item.price,
                          unit: item.unit,
                          image_url: item.image_url,
                        })
                      }
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-black/5 last:border-b-0"
                >
                  <th className="sticky left-0 z-10 bg-[#f6f3ee] px-4 py-3.5 text-left font-semibold text-primary">
                    {row.label}
                  </th>
                  {items.map((item) => (
                    <td
                      key={item.productId}
                      className="px-4 py-3.5 text-center text-primary"
                    >
                      {row.get(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {count > 0 ? (
        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/products" className="text-primary-light hover:underline">
            ← เลือกสินค้าเพิ่ม
          </Link>
        </p>
      ) : null}
    </main>
  );
}

function ProductColumn({
  item,
  onRemove,
  onAddCart,
}: {
  item: {
    productId: number;
    slug: string;
    name: string;
    image_url: string | null;
  };
  onRemove: () => void;
  onAddCart: () => void;
}) {
  return (
    <div className="space-y-3 text-center">
      <div className="relative mx-auto aspect-square w-28 overflow-hidden rounded-2xl bg-accent-soft">
        {item.image_url ? (
          <MediaImage
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm text-muted shadow hover:text-primary"
          aria-label="ลบออก"
        >
          ×
        </button>
      </div>
      <Link
        href={`/products/${item.slug}`}
        className="font-heading block text-sm font-semibold text-primary hover:text-primary-light"
      >
        {item.name}
      </Link>
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onAddCart}
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
      </div>
    </div>
  );
}
