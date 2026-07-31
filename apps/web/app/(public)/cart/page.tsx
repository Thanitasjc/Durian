"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { MediaImage } from "@/components/MediaImage";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, updateQty, removeItem, clear, count } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string[] | null>(null);

  const total = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.qty,
    0,
  );

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/v1/public/checkout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_address: address.trim() || null,
          notes: notes.trim() || null,
          items: items.map((i) => ({
            product_id: i.productId,
            qty: i.qty,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errors = json.errors as Record<string, string[]> | undefined;
        const firstFieldError = errors
          ? Object.values(errors).flat()[0]
          : undefined;
        const msg =
          json.message ||
          errors?.items?.[0] ||
          errors?.quantity?.[0] ||
          firstFieldError ||
          "สั่งซื้อไม่สำเร็จ";
        throw new Error(typeof msg === "string" ? msg : "สั่งซื้อไม่สำเร็จ");
      }
      setSuccess(json.data?.order_numbers ?? []);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "สั่งซื้อไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-bold text-primary">ตะกร้าสินค้า</h1>
      <p className="mt-2 text-sm text-muted">{count} รายการ</p>

      {success ? (
        <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <p className="font-heading text-xl font-bold text-emerald-800">
            สั่งซื้อสำเร็จ
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            ตัดสต็อกคลังแล้ว · เลขออเดอร์: {success.join(", ")}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            เลือกสินค้าต่อ
          </Link>
        </div>
      ) : null}

      {!items.length && !success ? (
        <div className="mt-12 rounded-3xl border border-dashed border-black/10 bg-surface p-10 text-center">
          <p className="text-muted">ยังไม่มีสินค้าในตะกร้า</p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light"
          >
            เลือกสินค้า
          </Link>
        </div>
      ) : null}

      {items.length ? (
        <>
          <ul className="mt-10 space-y-4">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-accent-soft">
                  {item.image_url ? (
                    <MediaImage
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </div>
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
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-lg border border-black/10">
                      <button
                        type="button"
                        className="px-3 py-1 text-sm"
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        aria-label="ลดจำนวน"
                      >
                        −
                      </button>
                      <span className="min-w-8 px-2 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        aria-label="เพิ่มจำนวน"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => removeItem(item.productId)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-primary">
                  {((item.price ?? 0) * item.qty).toLocaleString("th-TH")} ฿
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
            <p className="text-sm text-muted">ยอดประมาณ</p>
            <p className="font-heading text-2xl font-bold text-primary">
              {total.toLocaleString("th-TH")} ฿
            </p>
          </div>

          <form
            onSubmit={placeOrder}
            className="mt-8 space-y-4 rounded-3xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <h2 className="font-heading text-lg font-bold text-primary">
              ยืนยันสั่งซื้อ (ตัดสต็อกคลังทันที)
            </h2>
            <div>
              <label className="text-xs font-semibold text-slate-600">ชื่อ *</label>
              <input
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                เบอร์โทร *
              </label>
              <input
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">ที่อยู่</label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">หมายเหตุ</label>
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {submitting ? "กำลังสั่งซื้อ..." : "สั่งซื้อและตัดสต็อก"}
            </button>
            <p className="text-center text-xs text-muted">
              สต็อกจะถูกตัดจากคลังสินค้าที่ผูกกับสินค้า · ยกเลิกออเดอร์ใน Admin จะคืนสต็อก
            </p>
          </form>
        </>
      ) : null}
    </main>
  );
}
