"use client";

import { useMemo, useState } from "react";
import { CompareButton } from "@/components/CompareButton";
import { WishlistButton } from "@/components/WishlistButton";
import { useCart } from "@/lib/cart";
import { productTypeLabel, type Product } from "@/lib/api";

type Props = {
  product: Product;
};

function formatMoney(n: number): string {
  return n.toLocaleString("th-TH", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function ProductPurchasePanel({ product }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const stock = product.stock_qty ?? 999;
  const weight = product.weight_kg ?? (product.unit === "kg" ? 3 : null);
  const pricePerKg = product.price;
  const unitPrice =
    pricePerKg != null && weight != null
      ? Math.round(pricePerKg * weight)
      : pricePerKg;

  const tagline =
    product.tagline || "ของแท้ 100% ไม่พูดมากอยากกินก็สั่งมา";

  const sellerName = product.seller_name || "สวนทุเรียนคงศิลา";
  const sellerPhone = product.seller_phone || "0641286178";
  const updatedAt = product.updated_at || product.created_at || null;
  const typeLabel =
    productTypeLabel[product.product_type] ?? product.product_type;

  const stockLabel = useMemo(() => {
    if (product.unit === "kg" || product.product_type === "fresh") {
      return `${stock.toLocaleString("th-TH")} ลูก`;
    }
    return `${stock.toLocaleString("th-TH")} ชิ้น`;
  }, [product.product_type, product.unit, stock]);

  function changeQty(delta: number) {
    setQty((q) => Math.max(1, Math.min(stock || 99, q + delta)));
  }

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: unitPrice,
        unit: weight != null ? "ลูก" : product.unit,
        image_url: product.image_url,
      },
      qty,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  const actionBtnClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

  return (
    <div className="space-y-4">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {typeLabel}
        </span>
        {product.badge ? (
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
            {product.badge}
          </span>
        ) : null}
      </div>

      {/* Title */}
      <h1 className="font-heading text-2xl font-bold text-slate-800 md:text-[1.75rem] md:leading-snug">
        {product.name}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center sm:px-3">
          <p className="text-[11px] text-slate-500 sm:text-xs">คงเหลือ</p>
          <p className="mt-1 text-sm font-bold text-slate-800 sm:text-[15px]">
            {stockLabel}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center sm:px-3">
          <p className="text-[11px] text-slate-500 sm:text-xs">น้ำหนัก/ลูก</p>
          <p className="mt-1 text-sm font-bold text-slate-800 sm:text-[15px]">
            {weight != null ? `${Number(weight).toFixed(2)} กก.` : "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-2 py-3 text-center sm:px-3">
          <p className="text-[11px] text-emerald-700/70 sm:text-xs">ราคา/กก.</p>
          <p className="mt-1 text-sm font-bold text-emerald-600 sm:text-[15px]">
            {pricePerKg != null ? `${formatMoney(pricePerKg)} ฿` : "สอบถาม"}
          </p>
        </div>
      </div>

      {/* Tagline */}
      <div className="flex items-center gap-2.5 rounded-xl border-l-[3px] border-emerald-500 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 text-emerald-600"
          aria-hidden
        >
          <path
            d="M8 7h8M8 12h8M8 17h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M5 3h14a1 1 0 011 1v16l-3-2-3 2-3-2-3 2-3-2V4a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span>{tagline}</span>
      </div>

      {/* Total */}
      <div className="rounded-2xl bg-emerald-50 px-4 py-3.5 text-center">
        <p className="text-sm text-slate-600">
          ราคารวมต่อลูก{" "}
          <span className="ml-1 text-2xl font-bold text-emerald-600 md:text-[1.75rem]">
            {unitPrice != null ? `${formatMoney(unitPrice)} บาท` : "สอบถามราคา"}
          </span>
        </p>
      </div>

      {/* Qty + Cart */}
      <div className="flex items-center gap-3">
        <div className="inline-flex shrink-0 items-center rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            className="flex h-11 w-10 items-center justify-center text-lg text-slate-500 transition hover:bg-slate-50"
            onClick={() => changeQty(-1)}
            aria-label="ลดจำนวน"
          >
            −
          </button>
          <span className="min-w-8 text-center text-base font-semibold tabular-nums text-slate-800">
            {qty}
          </span>
          <button
            type="button"
            className="flex h-11 w-10 items-center justify-center text-lg text-slate-500 transition hover:bg-slate-50"
            onClick={() => changeQty(1)}
            aria-label="เพิ่มจำนวน"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <svg width="18" height="18" viewBox="0 0 21 22" fill="none" aria-hidden>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.48626 20.5H14.8341C17.9004 20.5 20.2528 19.3924 19.5847 14.9348L18.8066 8.89359C18.3947 6.66934 16.976 5.81808 15.7311 5.81808H5.55262C4.28946 5.81808 2.95308 6.73341 2.4771 8.89359L1.69907 14.9348C1.13157 18.889 3.4199 20.5 6.48626 20.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.34902 5.5984C6.34902 3.21232 8.28331 1.27803 10.6694 1.27803V1.27803C11.8184 1.27316 12.922 1.72619 13.7362 2.53695C14.5504 3.3477 15.0081 4.44939 15.0081 5.5984V5.5984"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {added ? "เพิ่มแล้ว ✓" : "เพิ่มในตะกร้า"}
        </button>
      </div>

      {/* Seller */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
        {updatedAt ? (
          <p className="absolute top-3.5 right-3.5 flex max-w-[45%] items-center gap-1 truncate text-[10px] text-slate-400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 7v5l3 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="truncate">{updatedAt}</span>
          </p>
        ) : null}
        <div className="flex items-center gap-3 pr-28">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-800">{sellerName}</p>
            <a
              href={`tel:${sellerPhone.replace(/\D/g, "")}`}
              className="text-sm text-slate-500 hover:text-emerald-600"
            >
              {sellerPhone}
            </a>
          </div>
        </div>
      </div>

      {/* Wishlist + Compare */}
      <div className="grid grid-cols-2 gap-3">
        <WishlistButton product={product} variant="button" className={actionBtnClass} />
        <CompareButton product={product} variant="button" className={actionBtnClass} />
      </div>
    </div>
  );
}
