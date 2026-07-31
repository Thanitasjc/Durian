"use client";

import { useEffect, useMemo, useState } from "react";
import { CrudPage } from "@/components/admin/CrudPage";
import { adminFetch } from "@/lib/admin-api";

export default function ProductsAdminPage() {
  const [inventoryOptions, setInventoryOptions] = useState<
    { value: string; label: string }[]
  >([{ value: "", label: "— ไม่ผูกคลัง —" }]);

  useEffect(() => {
    adminFetch<{
      data: Array<{
        id: number;
        name: string;
        quantity: number;
        unit: string;
        lot_number?: string | null;
      }>;
    }>("/inventory-items")
      .then((res) => {
        setInventoryOptions([
          { value: "", label: "— ไม่ผูกคลัง —" },
          ...res.data.map((i) => ({
            value: String(i.id),
            label: `${i.name} · คงเหลือ ${i.quantity} ${i.unit}${
              i.lot_number ? ` (${i.lot_number})` : ""
            }`,
          })),
        ]);
      })
      .catch(() => undefined);
  }, []);

  const fields = useMemo(
    () => [
      { name: "name", label: "ชื่อสินค้า", required: true as const },
      { name: "name_en", label: "ชื่ออังกฤษ" },
      { name: "slug", label: "Slug" },
      {
        name: "product_type",
        label: "ประเภท",
        type: "select" as const,
        required: true as const,
        options: [
          { value: "fresh", label: "ทุเรียนสด" },
          { value: "flesh", label: "เนื้อสด" },
          { value: "frozen", label: "แช่แข็ง" },
          { value: "dried", label: "อบแห้ง" },
        ],
      },
      { name: "price", label: "ราคา (ต่อ กก./หน่วย)", type: "number" as const },
      { name: "unit", label: "หน่วยขาย (แสดง)" },
      { name: "weight_kg", label: "น้ำหนักต่อลูก (กก.)", type: "number" as const },
      {
        name: "inventory_item_id",
        label: "ผูกคลังสินค้า (ตัดสต็อกอัตโนมัติ)",
        type: "select" as const,
        options: inventoryOptions,
      },
      {
        name: "stock_qty",
        label: "คงเหลือแสดงหน้าเว็บ (ลูก) — sync จากคลังถ้าผูกแล้ว",
        type: "number" as const,
      },
      { name: "badge", label: "แบดจ์" },
      { name: "tagline", label: "ข้อความสั้นใต้สถิติ" },
      { name: "seller_name", label: "ชื่อผู้ขาย / สวน" },
      { name: "seller_phone", label: "เบอร์โทรผู้ขาย" },
      {
        name: "image_url",
        label: "รูปหลัก (ปก)",
        type: "image" as const,
        collection: "products",
      },
      {
        name: "gallery_images",
        label: "แกลเลอรี่รูปสินค้า",
        type: "gallery" as const,
        collection: "products",
      },
      { name: "description", label: "รายละเอียด", type: "textarea" as const },
      { name: "sort_order", label: "ลำดับแสดง", type: "number" as const },
      {
        name: "is_published",
        label: "เผยแพร่",
        type: "select" as const,
        options: [
          { value: "1", label: "ใช่" },
          { value: "0", label: "ไม่" },
        ],
      },
      {
        name: "is_featured",
        label: "แสดงในสินค้าแนะนำ",
        type: "select" as const,
        options: [
          { value: "1", label: "ใช่" },
          { value: "0", label: "ไม่" },
        ],
      },
      {
        name: "is_hot",
        label: "แสดงใน Hot products",
        type: "select" as const,
        options: [
          { value: "1", label: "ใช่" },
          { value: "0", label: "ไม่" },
        ],
      },
    ],
    [inventoryOptions],
  );

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-primary">
        ผูกสินค้ากับรายการใน <strong>คลังสินค้า</strong> เพื่อตัดสต็อกอัตโนมัติตอนสั่งซื้อ
        (ถ้าคลังเป็น กก. ระบบจะตัด = จำนวนลูก × น้ำหนัก/ลูก)
      </p>
      <CrudPage
        title="สินค้าบนเว็บ"
        endpoint="/products"
        columns={[
          {
            key: "image_url",
            label: "รูป",
            render: (r) =>
              r.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(r.image_url)}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                "-"
              ),
          },
          { key: "name", label: "ชื่อ" },
          { key: "product_type", label: "ประเภท" },
          { key: "price", label: "ราคา" },
          {
            key: "stock_qty",
            label: "คงเหลือ",
            render: (r) => String(r.stock_qty ?? "—"),
          },
          {
            key: "inventory_item_id",
            label: "คลัง",
            render: (r) => (r.inventory_item_id ? `#${r.inventory_item_id}` : "—"),
          },
          {
            key: "is_published",
            label: "เผยแพร่",
            render: (r) => (r.is_published ? "ใช่" : "ไม่"),
          },
        ]}
        fields={fields}
        createDefaults={{
          product_type: "fresh",
          unit: "kg",
          stock_qty: 0,
          weight_kg: 3,
          inventory_item_id: "",
          is_published: "1",
          is_featured: "0",
          is_hot: "0",
          gallery_images: [],
          sort_order: 10,
        }}
        mapRowToForm={(row) => ({
          name: String(row.name ?? ""),
          name_en: String(row.name_en ?? ""),
          slug: String(row.slug ?? ""),
          product_type: String(row.product_type ?? "fresh"),
          price: Number(row.price ?? 0),
          unit: String(row.unit ?? "kg"),
          stock_qty: Number(row.stock_qty ?? 0),
          weight_kg: Number(row.weight_kg ?? 3),
          inventory_item_id: row.inventory_item_id
            ? String(row.inventory_item_id)
            : "",
          badge: String(row.badge ?? ""),
          tagline: String(row.tagline ?? ""),
          seller_name: String(row.seller_name ?? ""),
          seller_phone: String(row.seller_phone ?? ""),
          image_url: String(row.image_url ?? ""),
          gallery_images: Array.isArray(row.gallery_images)
            ? (row.gallery_images as string[])
            : [],
          description: String(row.description ?? ""),
          sort_order: Number(row.sort_order ?? 0),
          is_published: row.is_published ? "1" : "0",
          is_featured: row.is_featured ? "1" : "0",
          is_hot: row.is_hot ? "1" : "0",
        })}
      />
    </div>
  );
}
