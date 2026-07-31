"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function WebsiteSectionsAdminPage() {
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-primary">
        จัดการเนื้อหาแต่ละ section บนหน้าแรก{" "}
        <a href="http://localhost:3000/" className="font-semibold underline">
          localhost:3000
        </a>
        — Hero slides จัดการที่{" "}
        <a href="/admin/hero" className="font-semibold underline">
          Hero Banner
        </a>{" "}
        · key: <code>hero</code>, <code>story</code>, <code>sustainability</code>,{" "}
        <code>hot_products</code>, <code>products</code>, <code>tours</code>,{" "}
        <code>trace</code>
      </p>
      <CrudPage
        title="จัดการหน้าแรก (Sections)"
        endpoint="/site-sections"
        columns={[
          { key: "sort_order", label: "#" },
          {
            key: "image_url",
            label: "รูป",
            render: (r) =>
              r.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={String(r.image_url)}
                  alt=""
                  className="h-10 w-14 rounded object-cover"
                />
              ) : (
                "-"
              ),
          },
          { key: "key", label: "Section Key" },
          { key: "title", label: "หัวข้อ" },
          {
            key: "is_active",
            label: "แสดง",
            render: (r) => (r.is_active ? "เปิด" : "ปิด"),
          },
        ]}
        fields={[
          {
            name: "key",
            label: "Key (hero/story/sustainability/products/tours/trace)",
            required: true,
          },
          { name: "title", label: "หัวข้อ" },
          { name: "eyebrow", label: "Eyebrow / ป้ายเล็ก" },
          { name: "subtitle", label: "หัวข้อรอง", type: "textarea" },
          { name: "body", label: "เนื้อหา", type: "textarea" },
          {
            name: "image_url",
            label: "รูปภาพ",
            type: "image",
            collection: "site",
          },
          { name: "cta_label", label: "ปุ่มหลัก" },
          { name: "cta_link", label: "ลิงก์ปุ่มหลัก" },
          { name: "cta_label_2", label: "ปุ่มรอง" },
          { name: "cta_link_2", label: "ลิงก์ปุ่มรอง" },
          {
            name: "meta",
            label: "Meta JSON (stats/cards/bullets/slides)",
            type: "textarea",
          },
          { name: "sort_order", label: "ลำดับ", type: "number" },
          {
            name: "is_active",
            label: "แสดงบนเว็บ",
            type: "select",
            options: [
              { value: "1", label: "เปิด" },
              { value: "0", label: "ปิด" },
            ],
          },
        ]}
        createDefaults={{ sort_order: 10, is_active: "1", key: "" }}
        mapRowToForm={(row) => ({
          key: String(row.key ?? ""),
          title: String(row.title ?? ""),
          eyebrow: String(row.eyebrow ?? ""),
          subtitle: String(row.subtitle ?? ""),
          body: String(row.body ?? ""),
          image_url: String(row.image_url ?? ""),
          cta_label: String(row.cta_label ?? ""),
          cta_link: String(row.cta_link ?? ""),
          cta_label_2: String(row.cta_label_2 ?? ""),
          cta_link_2: String(row.cta_link_2 ?? ""),
          meta:
            row.meta != null
              ? JSON.stringify(row.meta, null, 2)
              : "",
          sort_order: Number(row.sort_order ?? 0),
          is_active: row.is_active ? "1" : "0",
        })}
      />
    </div>
  );
}
