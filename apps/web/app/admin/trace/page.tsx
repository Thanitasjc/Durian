"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin-api";

type Step = { step: string; title: string; detail: string };

export default function TraceAdminPage() {
  const [code, setCode] = useState("LOT-2026-0001");
  const [timeline, setTimeline] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setError(null);
    try {
      const res = await adminFetch<{ data: { timeline: Step[] } }>(
        `/trace?code=${encodeURIComponent(code)}`,
      );
      setTimeline(res.data.timeline);
    } catch (e) {
      setTimeline([]);
      setError(e instanceof Error ? e.message : "ไม่พบข้อมูล");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">ตรวจสอบย้อนกลับ</h1>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="button"
          onClick={search}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          ค้นหา
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ol className="relative ml-3 space-y-4 border-l-2 border-primary-light pl-6">
        {timeline.map((s) => (
          <li key={s.step + s.title} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary" />
            <p className="text-xs font-bold text-primary-light">{s.title}</p>
            <p className="text-sm text-slate-600">{s.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
