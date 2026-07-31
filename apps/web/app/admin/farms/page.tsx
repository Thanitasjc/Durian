"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function FarmsAdminPage() {
  return (
    <CrudPage
      title="จัดการฟาร์ม"
      endpoint="/farms"
      columns={[
        { key: "code", label: "รหัส" },
        { key: "name", label: "ชื่อฟาร์ม" },
        { key: "location", label: "ที่ตั้ง" },
        { key: "area_rai", label: "พื้นที่ (ไร่)" },
        {
          key: "map_provider",
          label: "แผนที่",
          render: (r) =>
            r.map_provider === "google" ? "Google Maps" : "รูปภาพ",
        },
        {
          key: "is_active",
          label: "สถานะ",
          render: (r) => (r.is_active ? "ใช้งาน" : "ปิด"),
        },
      ]}
      fields={[
        { name: "code", label: "รหัสฟาร์ม", required: true },
        { name: "name", label: "ชื่อฟาร์ม", required: true },
        { name: "location", label: "ที่ตั้ง" },
        { name: "area_rai", label: "พื้นที่ (ไร่)", type: "number" },
        {
          name: "map_provider",
          label: "ประเภทแผนที่",
          type: "select",
          options: [
            { value: "image", label: "รูปภาพแผนที่" },
            { value: "google", label: "Google Maps (ดาวเทียม)" },
          ],
        },
        {
          name: "map_image_url",
          label: "รูปแผนที่แปลง (โหมดรูปภาพ)",
          type: "image",
          collection: "farms",
        },
        { name: "map_lat", label: "Latitude (Google)", type: "number" },
        { name: "map_lng", label: "Longitude (Google)", type: "number" },
        { name: "map_zoom", label: "Zoom (3–21)", type: "number" },
        { name: "notes", label: "หมายเหตุ", type: "textarea" },
        {
          name: "is_active",
          label: "สถานะ",
          type: "select",
          options: [
            { value: "1", label: "ใช้งาน" },
            { value: "0", label: "ปิด" },
          ],
        },
      ]}
      createDefaults={{
        is_active: "1",
        map_provider: "image",
        map_zoom: 16,
        map_lat: 12.6113,
        map_lng: 102.1038,
      }}
      mapRowToForm={(row) => ({
        code: String(row.code ?? ""),
        name: String(row.name ?? ""),
        location: String(row.location ?? ""),
        area_rai: Number(row.area_rai ?? 0),
        map_provider: String(row.map_provider ?? "image"),
        map_image_url: String(row.map_image_url ?? ""),
        map_lat: row.map_lat == null ? "" : Number(row.map_lat),
        map_lng: row.map_lng == null ? "" : Number(row.map_lng),
        map_zoom: Number(row.map_zoom ?? 16),
        notes: String(row.notes ?? ""),
        is_active: row.is_active ? "1" : "0",
      })}
    />
  );
}
