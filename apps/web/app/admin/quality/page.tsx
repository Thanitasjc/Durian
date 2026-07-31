"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function QualityAdminPage() {
  return (
    <CrudPage
      title="คุณภาพ & คัดเกรด"
      endpoint="/quality-inspections"
      columns={[
        { key: "id", label: "ID" },
        {
          key: "lot",
          label: "LOT",
          render: (r) =>
            String((r.lot as { lot_number?: string } | null)?.lot_number ?? "-"),
        },
        { key: "grade_a_weight", label: "เกรด A" },
        { key: "grade_b_weight", label: "เกรด B" },
        { key: "processing_weight", label: "แปรรูป" },
        { key: "reject_weight", label: "Reject" },
        { key: "allocation_path", label: "ปลายทาง" },
        { key: "status", label: "สถานะ" },
      ]}
      fields={[
        { name: "lot_id", label: "Lot ID", type: "number" },
        { name: "receiving_id", label: "Receiving ID", type: "number" },
        { name: "inspector", label: "ผู้ตรวจ" },
        { name: "grade_a_weight", label: "น้ำหนักเกรด A", type: "number" },
        { name: "grade_b_weight", label: "น้ำหนักเกรด B", type: "number" },
        { name: "processing_weight", label: "น้ำหนักแปรรูป", type: "number" },
        { name: "reject_weight", label: "น้ำหนัก Reject", type: "number" },
        { name: "brix", label: "Brix" },
        { name: "defects", label: "ตำหนิ", type: "textarea" },
        {
          name: "allocation_path",
          label: "เส้นทางแปรรูป",
          type: "select",
          options: [
            { value: "fresh", label: "ทุเรียนสด" },
            { value: "flesh", label: "เนื้อสด" },
            { value: "frozen", label: "แช่แข็ง" },
            { value: "dried", label: "อบแห้ง" },
          ],
        },
        {
          name: "status",
          label: "สถานะ",
          type: "select",
          options: [
            { value: "รอตรวจ", label: "รอตรวจ" },
            { value: "กำลังคัดแยก", label: "กำลังคัดแยก" },
            { value: "อนุมัติ", label: "อนุมัติ" },
            { value: "ปฏิเสธ", label: "ปฏิเสธ" },
          ],
        },
      ]}
      createDefaults={{ status: "รอตรวจ" }}
    />
  );
}
