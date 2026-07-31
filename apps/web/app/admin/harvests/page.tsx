"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function HarvestsAdminPage() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        เมื่อบันทึกการเก็บเกี่ยว ระบบจะสร้าง <strong>LOT</strong> อัตโนมัติ
      </p>
      <CrudPage
        title="บันทึกการเก็บเกี่ยว"
        endpoint="/harvests"
        columns={[
          {
            key: "lot",
            label: "LOT",
            render: (r) =>
              String((r.lot as { lot_number?: string } | null)?.lot_number ?? "-"),
          },
          { key: "harvest_date", label: "วันที่" },
          {
            key: "farm",
            label: "ฟาร์ม",
            render: (r) => String((r.farm as { name?: string } | null)?.name ?? "-"),
          },
          {
            key: "plot",
            label: "แปลง",
            render: (r) => String((r.plot as { code?: string } | null)?.code ?? "-"),
          },
          { key: "variety", label: "พันธุ์" },
          { key: "total_weight", label: "น้ำหนัก (กก.)" },
          { key: "status", label: "สถานะ" },
        ]}
        fields={[
          { name: "farm_id", label: "Farm ID", type: "number", required: true },
          { name: "plot_id", label: "Plot ID", type: "number", required: true },
          { name: "harvest_date", label: "วันที่เก็บเกี่ยว", type: "date", required: true },
          { name: "variety", label: "พันธุ์" },
          { name: "quantity", label: "จำนวนลูก", type: "number", required: true },
          { name: "total_weight", label: "น้ำหนักรวม (กก.)", type: "number", required: true },
          { name: "harvest_team", label: "ทีมเก็บเกี่ยว" },
          { name: "notes", label: "หมายเหตุ", type: "textarea" },
        ]}
      />
    </div>
  );
}
