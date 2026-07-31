"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

type DashboardData = {
  kpis: Record<string, number>;
  recent_orders: Array<Record<string, unknown>>;
  pending_inspections: Array<Record<string, unknown>>;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<{ data: DashboardData }>("/dashboard")
      .then((res) => setData(res.data))
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ"));
  }, []);

  const kpis = [
    { key: "harvested_season", label: "เก็บเกี่ยวฤดูกาลนี้", unit: "กก." },
    { key: "raw_material", label: "วัตถุดิบคงเหลือ", unit: "กก." },
    { key: "fresh_stock", label: "ทุเรียนสด", unit: "กก." },
    { key: "flesh_stock", label: "เนื้อสด", unit: "กก." },
    { key: "frozen_stock", label: "แช่แข็ง", unit: "กก." },
    { key: "dried_stock", label: "อบแห้ง", unit: "กก." },
    { key: "today_production", label: "ผลิตวันนี้", unit: "กก." },
    { key: "pending_qc", label: "รอ QC", unit: "รายการ" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-slate-800">แดชบอร์ดผู้บริหาร</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500">{k.label}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-primary">
              {data ? Number(data.kpis[k.key] ?? 0).toLocaleString("th-TH") : "—"}
            </p>
            <p className="text-[11px] text-slate-400">{k.unit}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-sm font-bold">ออเดอร์ล่าสุด</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.recent_orders ?? []).map((o) => (
              <li key={String(o.id)} className="flex justify-between border-b border-slate-50 py-2">
                <span className="font-mono text-primary">{String(o.order_number)}</span>
                <span>{String(o.status)}</span>
              </li>
            ))}
            {!data?.recent_orders?.length ? (
              <li className="text-slate-400">ยังไม่มีออเดอร์</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-sm font-bold">รอตรวจคุณภาพ</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.pending_inspections ?? []).map((q) => (
              <li key={String(q.id)} className="flex justify-between border-b border-slate-50 py-2">
                <span>#{String(q.id)}</span>
                <span>{String(q.status)}</span>
              </li>
            ))}
            {!data?.pending_inspections?.length ? (
              <li className="text-slate-400">ไม่มีรายการรอตรวจ</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
