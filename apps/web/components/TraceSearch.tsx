"use client";

import { useState } from "react";
import type { TraceStep } from "@/lib/api";

export function TraceSearch() {
  const [code, setCode] = useState("LOT-2026-0084");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TraceStep[] | null>(null);

  async function search() {
    setLoading(true);
    setError(null);
    setTimeline(null);
    try {
      const res = await fetch(
        `/api/v1/public/trace?code=${encodeURIComponent(code.trim())}`,
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "ไม่พบข้อมูล");
        return;
      }
      setTimeline(json.data.timeline as TraceStep[]);
    } catch {
      setError("ไม่สามารถเชื่อมต่อ API ได้ กรุณาเปิด Laravel server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-surface p-4 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="LOT-2026-0001 / FROZEN-2026-0001"
          className="flex-1 rounded-xl border border-black/10 px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-60"
        >
          {loading ? "กำลังค้นหา..." : "ค้นหาเส้นทาง"}
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {timeline ? (
        <ol className="relative ml-4 space-y-6 border-l-2 border-primary-light pl-8">
          {timeline.map((step) => (
            <li key={step.step} className="relative">
              <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-surface bg-primary-light" />
              <div className="rounded-xl border border-black/5 bg-surface p-4">
                <p className="text-xs font-semibold uppercase text-primary-light">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
