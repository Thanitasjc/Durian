"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function InventoryAdminPage() {
  return (
    <CrudPage
      title="คลังสินค้า & สต็อก"
      endpoint="/inventory-items"
      columns={[
        { key: "name", label: "รายการ" },
        { key: "category", label: "หมวด" },
        { key: "product_type", label: "ประเภท" },
        { key: "lot_number", label: "LOT" },
        { key: "batch_number", label: "Batch" },
        { key: "quantity", label: "คงเหลือ" },
        { key: "storage_zone", label: "โซน" },
        { key: "expiry_date", label: "หมดอายุ" },
      ]}
      fields={[
        { name: "name", label: "ชื่อรายการ", required: true },
        {
          name: "category",
          label: "หมวด",
          type: "select",
          required: true,
          options: [
            { value: "raw", label: "วัตถุดิบ" },
            { value: "finished", label: "สำเร็จรูป" },
            { value: "packaging", label: "บรรจุภัณฑ์" },
          ],
        },
        {
          name: "product_type",
          label: "ประเภทสินค้า",
          type: "select",
          options: [
            { value: "fresh", label: "ทุเรียนสด" },
            { value: "flesh", label: "เนื้อสด" },
            { value: "frozen", label: "แช่แข็ง" },
            { value: "dried", label: "อบแห้ง" },
          ],
        },
        { name: "lot_number", label: "LOT" },
        { name: "batch_number", label: "Batch" },
        { name: "quantity", label: "จำนวน", type: "number", required: true },
        { name: "unit", label: "หน่วย" },
        {
          name: "storage_zone",
          label: "โซนจัดเก็บ",
          type: "select",
          options: [
            { value: "fresh", label: "Fresh" },
            { value: "chilled", label: "Chilled" },
            { value: "frozen", label: "Frozen" },
            { value: "dry", label: "Dry" },
          ],
        },
        { name: "location", label: "ตำแหน่ง" },
        { name: "production_date", label: "วันที่ผลิต", type: "date" },
        { name: "expiry_date", label: "วันหมดอายุ", type: "date" },
        {
          name: "rotation_method",
          label: "หมุนเวียน",
          type: "select",
          options: [
            { value: "FEFO", label: "FEFO" },
            { value: "FIFO", label: "FIFO" },
          ],
        },
      ]}
      createDefaults={{ category: "finished", unit: "kg", rotation_method: "FEFO" }}
    />
  );
}
