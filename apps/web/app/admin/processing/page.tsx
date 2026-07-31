"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function ProcessingAdminPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        ระบบคำนวณ <strong>Yield %</strong> จาก Input / Output อัตโนมัติ และสร้าง Batch Number ให้
      </p>
      <CrudPage
        title="กระบวนการแปรรูป"
        endpoint="/production-batches"
        columns={[
          { key: "batch_number", label: "Batch" },
          { key: "product_type", label: "ประเภท" },
          { key: "input_weight", label: "Input" },
          { key: "output_weight", label: "Output" },
          { key: "yield_percent", label: "Yield %" },
          { key: "operator", label: "ผู้ปฏิบัติงาน" },
          { key: "status", label: "สถานะ" },
        ]}
        fields={[
          { name: "lot_id", label: "Lot ID", type: "number" },
          {
            name: "product_type",
            label: "ประเภทสินค้า",
            type: "select",
            required: true,
            options: [
              { value: "fresh", label: "ทุเรียนสด" },
              { value: "flesh", label: "เนื้อสด" },
              { value: "frozen", label: "แช่แข็ง" },
              { value: "dried", label: "อบแห้ง" },
            ],
          },
          { name: "input_weight", label: "น้ำหนักเข้า (กก.)", type: "number", required: true },
          { name: "output_weight", label: "น้ำหนักออก (กก.)", type: "number" },
          { name: "production_date", label: "วันที่ผลิต", type: "date" },
          { name: "operator", label: "ผู้ปฏิบัติงาน" },
          { name: "current_step", label: "ขั้นตอนปัจจุบัน" },
          { name: "status", label: "สถานะ" },
          { name: "notes", label: "หมายเหตุ", type: "textarea" },
        ]}
        createDefaults={{ product_type: "flesh", status: "รอเริ่ม" }}
      />
    </div>
  );
}
