"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { adminFetch } from "@/lib/admin-api";
import { toPublicMediaUrl } from "@/lib/media";

export default function SettingsAdminPage() {
  const [companyName, setCompanyName] = useState("");
  const [lotFormat, setLotFormat] = useState("LOT-{YYYY}-{0000}");
  const [logoUrl, setLogoUrl] = useState("");
  const [brandPrimary, setBrandPrimary] = useState("AuraGold");
  const [brandAccent, setBrandAccent] = useState("Durian");
  const [brandMode, setBrandMode] = useState("text");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch<{ data: Array<{ key: string; value: string | null }> }>(
      "/settings",
    )
      .then((res) => {
        for (const s of res.data) {
          if (s.key === "company_name") setCompanyName(s.value ?? "");
          if (s.key === "lot_format") setLotFormat(s.value ?? "");
          if (s.key === "site_logo_url") setLogoUrl(s.value ?? "");
          if (s.key === "site_brand_primary")
            setBrandPrimary(s.value ?? "AuraGold");
          if (s.key === "site_brand_accent")
            setBrandAccent(s.value ?? "Durian");
          if (s.key === "site_brand_mode") setBrandMode(s.value ?? "text");
        }
      })
      .catch(() => undefined);
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminFetch<{ message: string }>("/settings", {
        method: "PUT",
        body: JSON.stringify({
          settings: [
            { key: "company_name", value: companyName, group: "company" },
            { key: "lot_format", value: lotFormat, group: "numbering" },
            { key: "site_logo_url", value: logoUrl || null, group: "branding" },
            {
              key: "site_brand_primary",
              value: brandPrimary || null,
              group: "branding",
            },
            {
              key: "site_brand_accent",
              value: brandAccent || null,
              group: "branding",
            },
            { key: "site_brand_mode", value: brandMode, group: "branding" },
          ],
        }),
      });
      setMessage(res.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">ตั้งค่าระบบ</h1>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-primary">
          โลโก้ / ชื่อแบรนด์ (Header)
        </h2>
        <p className="text-xs text-slate-500">
          เลือกแสดงเป็นข้อความ รูปโลโก้ หรือทั้งคู่ บนเว็บสาธารณะ
        </p>

        <div>
          <label className="text-xs font-semibold text-slate-600">
            โหมดแสดงผล
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={brandMode}
            onChange={(e) => setBrandMode(e.target.value)}
          >
            <option value="text">ข้อความอย่างเดียว</option>
            <option value="logo">รูปโลโก้อย่างเดียว</option>
            <option value="both">รูป + ข้อความ</option>
          </select>
        </div>

        <ImageUploadField
          label="รูปโลโก้"
          value={logoUrl}
          collection="branding"
          onChange={(url) => {
            setLogoUrl(url);
            if (url && brandMode === "text") {
              setBrandMode("logo");
            }
            if (!url && brandMode === "logo") {
              setBrandMode("text");
            }
          }}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">
              ข้อความหลัก
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={brandPrimary}
              onChange={(e) => setBrandPrimary(e.target.value)}
              placeholder="AuraGold"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              ข้อความสีรอง
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={brandAccent}
              onChange={(e) => setBrandAccent(e.target.value)}
              placeholder="Durian"
            />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
            ตัวอย่าง
          </p>
          <div className="flex items-center gap-2">
            {brandMode !== "text" && logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toPublicMediaUrl(logoUrl)}
                alt=""
                className="h-9 w-auto max-w-[140px] object-contain"
              />
            ) : null}
            {brandMode !== "logo" ? (
              <span className="font-heading text-lg font-bold text-primary">
                {brandPrimary || "AuraGold"}{" "}
                <span className="text-primary-light">
                  {brandAccent || "Durian"}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-primary">ทั่วไป</h2>
        <div>
          <label className="text-xs font-semibold">ชื่อสถานประกอบการ</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">รูปแบบรหัส LOT</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
            value={lotFormat}
            onChange={(e) => setLotFormat(e.target.value)}
          />
        </div>
      </section>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? "กำลังบันทึก..." : "บันทึก"}
      </button>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
}
