"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GalleryUploadField } from "@/components/admin/GalleryUploadField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { VideoUploadField } from "@/components/admin/VideoUploadField";
import { adminFetch } from "@/lib/admin-api";

type FormValue = string | number | string[];

type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "image"
    | "gallery"
    | "video";
  options?: { value: string; label: string }[];
  required?: boolean;
  collection?: string;
};

type Props = {
  title: string;
  endpoint: string;
  columns: {
    key: string;
    label: string;
    render?: (row: Record<string, unknown>) => React.ReactNode;
  }[];
  fields: Field[];
  createDefaults?: Record<string, FormValue>;
  mapRowToForm?: (row: Record<string, unknown>) => Record<string, FormValue>;
};

export function CrudPage({
  title,
  endpoint,
  columns,
  fields,
  createDefaults = {},
  mapRowToForm,
}: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, FormValue>>({});
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: Record<string, unknown>[] }>(endpoint);
      setRows(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const emptyForm = useMemo(() => {
    const base: Record<string, FormValue> = { ...createDefaults };
    for (const f of fields) {
      if (base[f.name] === undefined) {
        base[f.name] = f.type === "gallery" ? [] : "";
      }
    }
    return base;
  }, [createDefaults, fields]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    const mapped = mapRowToForm
      ? mapRowToForm(row)
      : Object.fromEntries(
          fields.map((f) => {
            if (f.type === "gallery") {
              const g = row[f.name];
              return [f.name, Array.isArray(g) ? (g as string[]) : []];
            }
            return [f.name, (row[f.name] as string | number) ?? ""];
          }),
        );
    setForm(mapped);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body = { ...form };
      if (editing?.id) {
        await adminFetch(`${endpoint}/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await adminFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("ยืนยันการลบรายการนี้?")) return;
    try {
      await adminFetch(`${endpoint}/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-slate-800">{title}</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-light"
        >
          + เพิ่มรายการ
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  กำลังโหลด...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  ยังไม่มีข้อมูล — กดเพิ่มรายการ
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-slate-50/80">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {c.render ? c.render(row) : String(row[c.key] ?? "-")}
                    </td>
                  ))}
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(Number(row.id))}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="font-heading text-lg font-bold">
              {editing ? "แก้ไขรายการ" : "เพิ่มรายการ"}
            </h2>
            <div className="mt-4 space-y-3">
              {fields.map((f) => {
                if (f.type === "image") {
                  return (
                    <ImageUploadField
                      key={f.name}
                      label={`${f.label}${f.required ? " *" : ""}`}
                      value={String(form[f.name] ?? "")}
                      collection={f.collection ?? "images"}
                      onChange={(url) =>
                        setForm((s) => ({ ...s, [f.name]: url }))
                      }
                    />
                  );
                }
                if (f.type === "gallery") {
                  const gallery = Array.isArray(form[f.name])
                    ? (form[f.name] as string[])
                    : [];
                  return (
                    <GalleryUploadField
                      key={f.name}
                      label={`${f.label}${f.required ? " *" : ""}`}
                      value={gallery}
                      collection={f.collection ?? "products"}
                      onChange={(urls) =>
                        setForm((s) => ({ ...s, [f.name]: urls }))
                      }
                    />
                  );
                }
                if (f.type === "video") {
                  return (
                    <VideoUploadField
                      key={f.name}
                      label={`${f.label}${f.required ? " *" : ""}`}
                      value={String(form[f.name] ?? "")}
                      collection={f.collection ?? "hero"}
                      onChange={(url) =>
                        setForm((s) => ({ ...s, [f.name]: url }))
                      }
                    />
                  );
                }
                return (
                  <div key={f.name}>
                    <label className="text-xs font-semibold text-slate-600">
                      {f.label}
                      {f.required ? " *" : ""}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        rows={3}
                        value={String(form[f.name] ?? "")}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, [f.name]: e.target.value }))
                        }
                      />
                    ) : f.type === "select" ? (
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        value={String(form[f.name] ?? "")}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, [f.name]: e.target.value }))
                        }
                      >
                        <option value="">เลือก</option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type ?? "text"}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        value={String(form[f.name] ?? "")}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            [f.name]:
                              f.type === "number"
                                ? e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                                : e.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
