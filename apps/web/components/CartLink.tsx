"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { MediaImage } from "@/components/MediaImage";

function CartBagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="21"
      height="22"
      viewBox="0 0 21 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
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
      <path
        d="M7.70365 10.1018H7.74942"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5343 10.1018H13.5801"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartLink() {
  const { count, toggleCart } = useCart();

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5"
      aria-label={`เปิดตะกร้า ${count} รายการ`}
      title="ตะกร้าสินค้า"
    >
      <CartBagIcon />
      <span className="absolute -top-1 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-primary">
        {count > 99 ? "99+" : count}
      </span>
    </button>
  );
}

export function CartMini() {
  const { items, count, isOpen, closeCart, updateQty, removeItem, clear } =
    useCart();

  const total = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.qty,
    0,
  );

  const inquiryHref = (() => {
    if (!items.length) return "/contact";
    const lines = items.map(
      (i) =>
        `- ${i.name} x${i.qty}${i.price != null ? ` (${formatPrice(i.price, i.unit)})` : ""}`,
    );
    const message = encodeURIComponent(
      `ต้องการสั่งซื้อ:\n${lines.join("\n")}\n\nยอดประมาณ: ${total.toLocaleString("th-TH")} บาท`,
    );
    return `/contact?subject=${encodeURIComponent("สั่งซื้อจากตะกร้า")}&message=${message}`;
  })();

  return (
    <>
      <div
        className={`fixed inset-0 z-[110] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed top-0 right-0 z-[120] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="ตะกร้าสินค้า"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <CartBagIcon className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-primary">
              ตะกร้าสินค้า
            </h2>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-primary">
              {count}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 hover:text-primary"
            aria-label="ปิดตะกร้า"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!items.length ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <CartBagIcon className="h-12 w-12 text-muted/40" />
              <p className="text-sm text-muted">ยังไม่มีสินค้าในตะกร้า</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
              >
                เลือกสินค้า
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 border-b border-black/5 pb-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
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
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="font-heading text-sm font-semibold text-primary hover:text-primary-light"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-xs text-muted hover:text-red-600"
                        aria-label={`ลบ ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-primary-light">
                      {formatPrice(item.price, item.unit)}
                    </p>
                    <div className="mt-2 inline-flex items-center rounded-lg border border-black/10">
                      <button
                        type="button"
                        className="px-2.5 py-1 text-sm"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        aria-label="ลดจำนวน"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        className="px-2.5 py-1 text-sm"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        aria-label="เพิ่มจำนวน"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-black/5 bg-[#f6f3ee] px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">ยอดประมาณ</span>
              <span className="font-heading text-lg font-bold text-primary">
                ฿{total.toLocaleString("th-TH")}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={inquiryHref}
                onClick={closeCart}
                className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white hover:bg-primary-light"
              >
                สั่งซื้อ / สอบถาม
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="rounded-xl border border-primary/20 px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-white"
              >
                ดูตะกร้าเต็ม
              </Link>
              <button
                type="button"
                onClick={clear}
                className="py-1 text-xs text-muted underline hover:text-primary"
              >
                ล้างตะกร้า
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
