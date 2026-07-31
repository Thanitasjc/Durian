"use client";

import { useState } from "react";
import { MediaImage } from "@/components/MediaImage";
import { formatPrice, productTypeLabel, type Product } from "@/lib/api";

type Tab = "description" | "info" | "reviews";

type Props = {
  product: Product;
};

export function ProductDetailsTabs({ product }: Props) {
  const [tab, setTab] = useState<Tab>("description");
  const typeLabel =
    productTypeLabel[product.product_type] ?? product.product_type;
  const unitLabel =
    product.unit === "kg" ? "กก." : product.unit === "pack" ? "แพ็ก" : product.unit;

  const tabs: { id: Tab; label: string }[] = [
    { id: "description", label: "รายละเอียด" },
    { id: "info", label: "ข้อมูลเพิ่มเติม" },
    { id: "reviews", label: `รีวิว (${product.review_count ?? 0})` },
  ];

  return (
    <section className="mt-20 border-t border-black/5 pt-14 pb-8">
      <div className="relative mx-auto max-w-3xl">
        <nav
          className="flex flex-wrap items-end justify-center gap-1 border-b border-black/10"
          role="tablist"
          aria-label="รายละเอียดสินค้า"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`relative px-5 py-3 text-sm font-semibold transition ${
                  active
                    ? "text-primary"
                    : "text-muted hover:text-primary"
                }`}
              >
                {t.label}
                {active ? (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto mt-12 max-w-5xl">
        {tab === "description" ? (
          <div role="tabpanel" className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="text-xs font-semibold tracking-[0.15em] text-primary-light uppercase">
                {typeLabel}
              </span>
              <h2 className="font-heading mt-3 text-2xl font-bold text-primary md:text-3xl">
                {product.name}
              </h2>
              {product.name_en ? (
                <p className="mt-1 text-sm text-muted">{product.name_en}</p>
              ) : null}
              <p className="mt-5 leading-relaxed text-muted">
                {product.description || "ยังไม่มีรายละเอียดสินค้า"}
              </p>
              {product.badge ? (
                <p className="mt-6 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
                  {product.badge}
                </p>
              ) : null}
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-accent-soft">
              {product.image_url ? (
                <MediaImage
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  ไม่มีรูป
                </div>
              )}
            </div>
          </div>
        ) : null}

        {tab === "info" ? (
          <div role="tabpanel" className="mx-auto max-w-2xl">
            <table className="w-full overflow-hidden rounded-2xl border border-black/5 bg-white text-sm shadow-sm">
              <tbody>
                {[
                  ["หมวดหมู่", typeLabel],
                  ["ราคา", formatPrice(product.price, product.unit)],
                  ["หน่วย", unitLabel],
                  ["ป้ายกำกับ", product.badge || "—"],
                  ["SKU / รหัส", product.slug.toUpperCase()],
                  [
                    "คะแนน",
                    `★ ${product.rating} (${product.review_count} รีวิว)`,
                  ],
                ].map(([label, value]) => (
                  <tr
                    key={label}
                    className="border-b border-black/5 last:border-b-0"
                  >
                    <td className="w-[40%] bg-[#f6f3ee]/px-5 py-3.5 font-semibold text-primary">
                      {label}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "reviews" ? (
          <div role="tabpanel" className="mx-auto max-w-xl text-center">
            <h3 className="font-heading text-2xl font-bold text-primary">
              รีวิวจากลูกค้า
            </h3>
            <p className="mt-3 text-sm text-muted">
              ★ {product.rating} · {product.review_count} รีวิว
            </p>
            {(product.review_count ?? 0) === 0 ? (
              <p className="mt-8 text-muted">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
            ) : (
              <div className="mt-10 space-y-4 text-left">
                <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-primary">
                    คะแนนเฉลี่ย {product.rating}/5
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    สรุปจาก {product.review_count} รีวิวของลูกค้าที่สั่งซื้อ
                    AuraGold Durian — คุณภาพและรสชาติเป็นไปตามมาตรฐานสวน
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
