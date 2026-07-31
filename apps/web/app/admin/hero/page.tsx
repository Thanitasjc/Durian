"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function HeroSlidesAdminPage() {
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-primary">
        จัดการสไลด์ Hero Banner — ใส่รูป และ/หรือวิดีโอ (YouTube, Vimeo, หรืออัปโหลด MP4)
      </p>
      <CrudPage
        title="Hero Banner (Slides)"
        endpoint="/hero-slides"
        columns={[
          { key: "sort_order", label: "#" },
          {
            key: "image_url",
            label: "สื่อ",
            render: (r) => {
              if (r.video_url) {
                return (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    วิดีโอ
                  </span>
                );
              }
              if (r.image_url) {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(r.image_url)}
                    alt=""
                    className="h-12 w-20 rounded object-cover"
                  />
                );
              }
              return "-";
            },
          },
          { key: "title", label: "หัวข้อ" },
          { key: "cta_label", label: "ปุ่มหลัก" },
          {
            key: "is_active",
            label: "แสดง",
            render: (r) => (r.is_active ? "เปิด" : "ปิด"),
          },
        ]}
        fields={[
          {
            name: "image_url",
            label: "รูปแบนเนอร์ (หรือโปสเตอร์วิดีโอ)",
            type: "image",
            collection: "hero",
          },
          {
            name: "video_url",
            label: "วิดีโอ",
            type: "video",
            collection: "hero",
          },
          { name: "eyebrow", label: "ป้ายเล็ก (eyebrow)" },
          { name: "title", label: "หัวข้อ" },
          { name: "subtitle", label: "หัวข้อรอง (สีเหลือง)" },
          { name: "body", label: "คำอธิบาย", type: "textarea" },
          { name: "cta_label", label: "ปุ่มหลัก" },
          { name: "cta_link", label: "ลิงก์ปุ่มหลัก" },
          { name: "cta_label_2", label: "ปุ่มรอง" },
          { name: "cta_link_2", label: "ลิงก์ปุ่มรอง" },
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
        createDefaults={{ sort_order: 10, is_active: "1", video_url: "" }}
        mapRowToForm={(row) => ({
          image_url: String(row.image_url ?? ""),
          video_url: String(row.video_url ?? ""),
          eyebrow: String(row.eyebrow ?? ""),
          title: String(row.title ?? ""),
          subtitle: String(row.subtitle ?? ""),
          body: String(row.body ?? ""),
          cta_label: String(row.cta_label ?? ""),
          cta_link: String(row.cta_link ?? ""),
          cta_label_2: String(row.cta_label_2 ?? ""),
          cta_link_2: String(row.cta_link_2 ?? ""),
          sort_order: Number(row.sort_order ?? 0),
          is_active: row.is_active ? "1" : "0",
        })}
      />
    </div>
  );
}
