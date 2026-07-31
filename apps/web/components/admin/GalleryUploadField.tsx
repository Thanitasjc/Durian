"use client";

import { useRef, useState } from "react";
import { getAdminToken } from "@/lib/admin-api";
import { getAdminMediaEndpoint } from "@/lib/admin-media";
import { toPublicMediaUrl } from "@/lib/media";

type Props = {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  collection?: string;
};

export function GalleryUploadField({
  label,
  value,
  onChange,
  collection = "products",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const images = Array.isArray(value) ? value : [];

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const token = getAdminToken();
    const next = [...images];
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("collection", collection);
        if (!token) throw new Error("กรุณาเข้าสู่ระบบ Admin ใหม่");
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
          throw new Error(
            json.message || `อัปโหลดไม่สำเร็จ (${res.status})`,
          );
        }
        next.push(toPublicMediaUrl(String(json.data.url)));
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const tmp = copy[index];
    copy[index] = copy[target];
    copy[target] = tmp;
    onChange(copy);
  }

  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="mt-1 space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        {images.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((url, index) => (
              <div
                key={url + index}
                className="relative overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toPublicMediaUrl(url)}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/50 p-1">
                  <button
                    type="button"
                    className="flex-1 rounded bg-white/90 text-[10px] font-bold"
                    onClick={() => move(index, -1)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded bg-white/90 text-[10px] font-bold text-red-600"
                    onClick={() => removeAt(index)}
                  >
                    ลบ
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded bg-white/90 text-[10px] font-bold"
                    onClick={() => move(index, 1)}
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-slate-400">
            ยังไม่มีรูปในแกลเลอรี่
          </p>
        )}

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-light disabled:opacity-60"
        >
          {uploading ? "กำลังอัปโหลด..." : "+ เพิ่มรูปแกลเลอรี่"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <p className="text-[10px] text-slate-400">
          เลือกได้หลายไฟล์ · JPG/PNG/WEBP · สูงสุด 10MB/ไฟล์
        </p>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
