"use client";

import { useRef, useState } from "react";
import { getAdminToken } from "@/lib/admin-api";
import { toPublicMediaUrl } from "@/lib/media";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  collection?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  collection = "images",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const token = getAdminToken();
      const body = new FormData();
      body.append("file", file);
      body.append("collection", collection);

      const res = await fetch("/api/v1/admin/media", {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });
      const json = await res.json();
      if (!res.ok) {
        const msg =
          json.message ||
          (json.errors?.file ? json.errors.file.join(", ") : null) ||
          "อัปโหลดไม่สำเร็จ";
        throw new Error(msg);
      }
      onChange(toPublicMediaUrl(String(json.data.url)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const preview = toPublicMediaUrl(value) || value;

  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="mt-1 space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            className="h-36 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-28 items-center justify-center text-xs text-slate-400">
            ยังไม่มีรูป — กดเลือกไฟล์ด้านล่าง
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-light disabled:opacity-60"
          >
            {uploading ? "กำลังอัปโหลด..." : "เลือกรูปจากเครื่อง"}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              ลบรูป
            </button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />

        <p className="text-[10px] text-slate-400">
          รองรับ JPG, PNG, WEBP · สูงสุด 10MB
        </p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
