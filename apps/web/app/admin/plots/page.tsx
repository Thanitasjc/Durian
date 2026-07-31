"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function PlotsAdminPage() {
  return (
    <CrudPage
      title="แปลงปลูก (Plots)"
      endpoint="/plots"
      columns={[
        { key: "code", label: "รหัสแปลง" },
        { key: "name", label: "ชื่อ" },
        {
          key: "farm",
          label: "ฟาร์ม",
          render: (r) =>
            String((r.farm as { name?: string } | null)?.name ?? "-"),
        },
        { key: "variety", label: "พันธุ์" },
        { key: "tree_count", label: "จำนวนต้น" },
        {
          key: "soil_moisture",
          label: "ความชื้น",
          render: (r) =>
            r.soil_moisture != null ? `${r.soil_moisture}%` : "—",
        },
        {
          key: "alert_level",
          label: "แจ้งเตือน",
          render: (r) => String(r.alert_level ?? "none"),
        },
        { key: "fruit_status", label: "สถานะผล" },
      ]}
      fields={[
        { name: "farm_id", label: "Farm ID", type: "number", required: true },
        { name: "code", label: "รหัสแปลง", required: true },
        { name: "name", label: "ชื่อแปลง", required: true },
        { name: "variety", label: "พันธุ์" },
        { name: "tree_count", label: "จำนวนต้น", type: "number" },
        { name: "avg_tree_age", label: "อายุเฉลี่ย", type: "number" },
        { name: "flowering_date", label: "วันดอกบาน", type: "date" },
        { name: "fruit_status", label: "สถานะผล" },
        { name: "expected_harvest_date", label: "คาดเก็บเกี่ยว", type: "date" },
        { name: "development_percent", label: "% พัฒนา", type: "number" },
        { name: "soil_moisture", label: "ความชื้นดิน %", type: "number" },
        {
          name: "alert_level",
          label: "ระดับแจ้งเตือน",
          type: "select",
          options: [
            { value: "none", label: "ปกติ" },
            { value: "warning", label: "Warning" },
            { value: "critical", label: "Critical" },
          ],
        },
        { name: "map_x", label: "Map X %", type: "number" },
        { name: "map_y", label: "Map Y %", type: "number" },
        { name: "map_w", label: "Map W %", type: "number" },
        { name: "map_h", label: "Map H %", type: "number" },
        { name: "notes", label: "หมายเหตุ", type: "textarea" },
      ]}
      createDefaults={{
        alert_level: "none",
        tree_count: 0,
        development_percent: 0,
      }}
      mapRowToForm={(row) => ({
        farm_id: Number(row.farm_id ?? 0),
        code: String(row.code ?? ""),
        name: String(row.name ?? ""),
        variety: String(row.variety ?? ""),
        tree_count: Number(row.tree_count ?? 0),
        avg_tree_age: Number(row.avg_tree_age ?? 0),
        flowering_date: String(row.flowering_date ?? "").slice(0, 10),
        fruit_status: String(row.fruit_status ?? ""),
        expected_harvest_date: String(row.expected_harvest_date ?? "").slice(
          0,
          10,
        ),
        development_percent: Number(row.development_percent ?? 0),
        soil_moisture:
          row.soil_moisture == null ? "" : Number(row.soil_moisture),
        alert_level: String(row.alert_level ?? "none"),
        map_x: row.map_x == null ? "" : Number(row.map_x),
        map_y: row.map_y == null ? "" : Number(row.map_y),
        map_w: row.map_w == null ? "" : Number(row.map_w),
        map_h: row.map_h == null ? "" : Number(row.map_h),
        notes: String(row.notes ?? ""),
      })}
    />
  );
}
