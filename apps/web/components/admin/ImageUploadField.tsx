"use client";

import { useEffect, useRef, useState } from "react";
import { getAdminToken } from "@/lib/admin-api";
import {
  getAdminMediaEndpoint,
  isDeadLocalMediaUrl,
} from "@/lib/admin-media";
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
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const clearedDead = useRef(false);

  // Clear dead /storage/... URLs left after Render redeploys (once)
  useEffect(() => {
    if (isDeadLocalMediaUrl(value) && !clearedDead.current) {
      clearedDead.current = true;
      onChange("");
      setBroken(false);
      return;
    }
    if (!isDeadLocalMediaUrl(value)) {
      clearedDead.current = false;
      setBroken(false);
    }
  }, [value, onChange]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function onFileChange(file: File | null) {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("ไฟล์ใหญ่เกิน 10MB");
      return;
    }

    if (localPreview) URL.revokeObjectURL(localPreview);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);
    setError(null);
    setBroken(false);

    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบ Admin ใหม่");
      }

      const body = new FormData();
      body.append("file", file);
      body.append("collection", collection);

      const res = await fetch(getAdminMediaEndpoint(), {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          json.message ||
          (json.errors?.file ? json.errors.file.join(", ") : null) ||
          `อัปโหลดไม่สำเร็จ (${res.status})`;
        throw new Error(msg);
      }

      const url = toPublicMediaUrl(String(json.data?.url ?? ""));
      if (!url) {
        throw new Error("อัปโหลดสำเร็จ แต่ไม่ได้รับ URL รูป");
      }
      onChange(url);
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const remote = !isDeadLocalMediaUrl(value)
    ? toPublicMediaUrl(value) || value
    : "";
  const preview = localPreview || (!broken ? remote : "");

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
            onError={() => {
              if (!localPreview) setBroken(true);
            }}
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
          {value || localPreview ? (
            <button
              type="button"
              onClick={() => {
                if (localPreview) URL.revokeObjectURL(localPreview);
                setLocalPreview(null);
                onChange("");
                setBroken(false);
                setError(null);
              }}
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
          รองรับ JPG, PNG, WEBP · สูงสุด 10MB · เก็บบน Supabase Storage
        </p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
