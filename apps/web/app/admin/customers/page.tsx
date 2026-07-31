"use client";

import { CrudPage } from "@/components/admin/CrudPage";

export default function CustomersAdminPage() {
  return (
    <CrudPage
      title="ลูกค้า"
      endpoint="/customers"
      columns={[
        { key: "code", label: "รหัส" },
        { key: "name", label: "ชื่อ" },
        { key: "phone", label: "โทร" },
        { key: "type", label: "ประเภท" },
      ]}
      fields={[
        { name: "name", label: "ชื่อลูกค้า", required: true },
        { name: "phone", label: "โทรศัพท์" },
        { name: "email", label: "อีเมล" },
        { name: "address", label: "ที่อยู่", type: "textarea" },
        {
          name: "type",
          label: "ประเภท",
          type: "select",
          options: [
            { value: "retail", label: "หน้าร้าน" },
            { value: "wholesale", label: "ขายส่ง" },
            { value: "export", label: "ส่งออก" },
          ],
        },
      ]}
      createDefaults={{ type: "retail" }}
    />
  );
}
