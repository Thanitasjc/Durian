"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function ReceivingsAdminPage() {
  return (
    <CrudPage
      title="รับเข้าวัตถุดิบ"
      endpoint="/receivings"
      columns={[
        { key: "receiving_number", label: "เลขที่ใบรับ" },
        {
          key: "lot",
          label: "LOT",
          render: (r) =>
            String((r.lot as { lot_number?: string } | null)?.lot_number ?? "-"),
        },
        { key: "total_weight", label: "น้ำหนัก" },
        { key: "receiver", label: "ผู้รับ" },
        { key: "status", label: "สถานะ" },
      ]}
      fields={[
        { name: "lot_id", label: "Lot ID", type: "number" },
        { name: "farm_id", label: "Farm ID", type: "number" },
        { name: "plot_id", label: "Plot ID", type: "number" },
        { name: "total_weight", label: "น้ำหนักรับเข้า (กก.)", type: "number", required: true },
        { name: "quantity", label: "จำนวน", type: "number" },
        { name: "receiver", label: "ผู้รับเข้า" },
        {
          name: "status",
          label: "สถานะ",
          type: "select",
          options: [
            { value: "รอตรวจรับ", label: "รอตรวจรับ" },
            { value: "รับเข้าแล้ว", label: "รับเข้าแล้ว" },
            { value: "กักกัน", label: "กักกัน" },
            { value: "ไม่ผ่าน", label: "ไม่ผ่าน" },
          ],
        },
        { name: "notes", label: "หมายเหตุ", type: "textarea" },
      ]}
      createDefaults={{ status: "รอตรวจรับ" }}
    />
  );
}
