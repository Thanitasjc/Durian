"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

export default function InquiriesAdminPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch<{ data: Record<string, unknown>[] }>(
        "/contact-inquiries",
      );
      setRows(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">ข้อความติดต่อจากเว็บ</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={String(r.id)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{String(r.name)}</p>
                <p className="text-xs text-slate-500">
                  {String(r.email)} · {String(r.phone ?? "-")}
                </p>
              </div>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={async () => {
                  if (!confirm("ลบข้อความนี้?")) return;
                  await adminFetch(`/contact-inquiries/${r.id}`, {
                    method: "DELETE",
                  });
                  load();
                }}
              >
                ลบ
              </button>
            </div>
            <p className="mt-2 text-sm font-medium">{String(r.subject ?? "-")}</p>
            <p className="mt-1 text-sm text-slate-600">{String(r.message)}</p>
          </div>
        ))}
        {!rows.length ? (
          <p className="text-sm text-slate-400">ยังไม่มีข้อความ</p>
        ) : null}
      </div>
    </div>
  );
}
