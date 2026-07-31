"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function OrdersAdminPage() {
  return (
    <CrudPage
      title="ขาย & คำสั่งซื้อ"
      endpoint="/orders"
      columns={[
        { key: "order_number", label: "รหัสออเดอร์" },
        { key: "customer_name", label: "ลูกค้า" },
        { key: "product_name", label: "สินค้า" },
        { key: "quantity", label: "ปริมาณ" },
        { key: "total_amount", label: "ยอดเงิน" },
        { key: "status", label: "สถานะ" },
        {
          key: "stock_deducted",
          label: "ตัดสต็อก",
          render: (r) => (r.stock_deducted ? "ตัดแล้ว" : "ยังไม่ตัด"),
        },
      ]}
      fields={[
        { name: "customer_id", label: "Customer ID", type: "number" },
        { name: "customer_name", label: "ชื่อลูกค้า" },
        { name: "product_id", label: "Product ID (ตัดคลังถ้าผูก)", type: "number" },
        { name: "product_name", label: "สินค้า", required: true },
        {
          name: "product_type",
          label: "ประเภท",
          type: "select",
          options: [
            { value: "fresh", label: "ทุเรียนสด" },
            { value: "flesh", label: "เนื้อสด" },
            { value: "frozen", label: "แช่แข็ง" },
            { value: "dried", label: "อบแห้ง" },
          ],
        },
        { name: "quantity", label: "ปริมาณ", type: "number", required: true },
        { name: "unit", label: "หน่วย" },
        { name: "total_amount", label: "ยอดเงิน (บาท)", type: "number", required: true },
        {
          name: "status",
          label: "สถานะ",
          type: "select",
          options: [
            { value: "รอชำระเงิน", label: "รอชำระเงิน" },
            { value: "กำลังเตรียมสินค้า", label: "กำลังเตรียมสินค้า" },
            { value: "พร้อมจัดส่ง", label: "พร้อมจัดส่ง" },
            { value: "จัดส่งแล้ว", label: "จัดส่งแล้ว" },
            { value: "สำเร็จ", label: "สำเร็จ" },
            { value: "ยกเลิก", label: "ยกเลิก" },
          ],
        },
        { name: "order_date", label: "วันที่สั่ง", type: "date" },
        { name: "notes", label: "หมายเหตุ", type: "textarea" },
      ]}
      createDefaults={{ status: "รอชำระเงิน", unit: "kg" }}
      mapRowToForm={(row) => ({
        customer_id: Number(row.customer_id ?? 0) || "",
        customer_name: String(row.customer_name ?? ""),
        product_id: Number(row.product_id ?? 0) || "",
        product_name: String(row.product_name ?? ""),
        product_type: String(row.product_type ?? "fresh"),
        quantity: Number(row.quantity ?? 0),
        unit: String(row.unit ?? "kg"),
        total_amount: Number(row.total_amount ?? 0),
        status: String(row.status ?? "รอชำระเงิน"),
        order_date: String(row.order_date ?? "").slice(0, 10),
        notes: String(row.notes ?? ""),
      })}
    />
  );
}
