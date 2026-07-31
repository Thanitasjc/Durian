"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin-api";

type NavRow = {
  id: number;
  label: string;
  href: string;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  parent?: { id: number; label: string } | null;
};

type Toolbar = {
  account: boolean;
  search: boolean;
  compare: boolean;
  wishlist: boolean;
  cart: boolean;
};

const EMPTY_FORM = {
  label: "",
  href: "/",
  parent_id: "",
  sort_order: 10,
  is_active: "1",
};

export default function HeaderAdminPage() {
  const [rows, setRows] = useState<NavRow[]>([]);
  const [toolbar, setToolbar] = useState<Toolbar>({
    account: true,
    search: true,
    compare: true,
    wishlist: true,
    cart: true,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<NavRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [navRes, settingsRes] = await Promise.all([
        adminFetch<{ data: NavRow[] }>("/nav-items"),
        adminFetch<{ data: Array<{ key: string; value: string | null }> }>(
          "/settings",
        ),
      ]);
      setRows(navRes.data);
      const next = { ...toolbar };
      for (const s of settingsRes.data) {
        if (s.key === "header_show_account")
          next.account = s.value !== "0" && s.value !== "false";
        if (s.key === "header_show_search")
          next.search = s.value !== "0" && s.value !== "false";
        if (s.key === "header_show_compare")
          next.compare = s.value !== "0" && s.value !== "false";
        if (s.key === "header_show_wishlist")
          next.wishlist = s.value !== "0" && s.value !== "false";
        if (s.key === "header_show_cart")
          next.cart = s.value !== "0" && s.value !== "false";
      }
      setToolbar(next);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const parentOptions = useMemo(
    () =>
      rows
        .filter((r) => !r.parent_id && (!editing || r.id !== editing.id))
        .map((r) => ({ value: String(r.id), label: r.label })),
    [rows, editing],
  );

  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      sort_order: (Math.max(0, ...rows.map((r) => r.sort_order)) || 0) + 10,
    });
    setOpen(true);
  }

  function openEdit(row: NavRow) {
    setEditing(row);
    setForm({
      label: row.label,
      href: row.href || "/",
      parent_id: row.parent_id ? String(row.parent_id) : "",
      sort_order: row.sort_order,
      is_active: row.is_active ? "1" : "0",
    });
    setOpen(true);
  }

  async function saveNav() {
    setSaving(true);
    setMessage(null);
    try {
      const body = {
        label: form.label.trim(),
        href: form.href.trim() || "/",
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active === "1",
      };
      if (editing) {
        await adminFetch(`/nav-items/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await adminFetch("/nav-items", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setOpen(false);
      setMessage("บันทึกเมนูแล้ว");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function removeNav(row: NavRow) {
    if (!confirm(`ลบเมนู “${row.label}” ?`)) return;
    try {
      await adminFetch(`/nav-items/${row.id}`, { method: "DELETE" });
      setMessage("ลบเมนูแล้ว");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    }
  }

  async function saveToolbar() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminFetch<{ message: string }>("/settings", {
        method: "PUT",
        body: JSON.stringify({
          settings: [
            {
              key: "header_show_account",
              value: toolbar.account ? "1" : "0",
              group: "header",
            },
            {
              key: "header_show_search",
              value: toolbar.search ? "1" : "0",
              group: "header",
            },
            {
              key: "header_show_compare",
              value: toolbar.compare ? "1" : "0",
              group: "header",
            },
            {
              key: "header_show_wishlist",
              value: toolbar.wishlist ? "1" : "0",
              group: "header",
            },
            {
              key: "header_show_cart",
              value: toolbar.cart ? "1" : "0",
              group: "header",
            },
          ],
        }),
      });
      setMessage(res.message || "บันทึกปุ่ม Header แล้ว");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">เมนู Header</h1>
        <p className="mt-1 text-sm text-slate-500">
          จัดการเมนูหลัก / เมนูย่อย และเปิด-ปิดปุ่มด้านขวา (บัญชี ค้นหา เปรียบเทียบ
          ถูกใจ ตะกร้า)
        </p>
      </div>

      {message ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-primary">
          ปุ่มด้านขวา (Toolbar)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["account", "บัญชีสมาชิก"],
              ["search", "ค้นหา (มือถือ)"],
              ["compare", "เปรียบเทียบ"],
              ["wishlist", "ถูกใจ"],
              ["cart", "ตะกร้า"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={toolbar[key]}
                onChange={(e) =>
                  setToolbar((t) => ({ ...t, [key]: e.target.checked }))
                }
              />
              {label}
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={saveToolbar}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          บันทึกปุ่ม Header
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-sm font-bold text-primary">
            เมนูนำทาง
          </h2>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
          >
            + เพิ่มเมนู
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">กำลังโหลด...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs text-slate-500">
                <tr>
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">ชื่อ</th>
                  <th className="py-2 pr-2">ลิงก์</th>
                  <th className="py-2 pr-2">เมนูหลัก</th>
                  <th className="py-2 pr-2">สถานะ</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-2 text-slate-400">
                      {row.sort_order}
                    </td>
                    <td className="py-2.5 pr-2 font-medium">
                      {row.parent_id ? (
                        <span className="text-slate-600">↳ {row.label}</span>
                      ) : (
                        row.label
                      )}
                    </td>
                    <td className="max-w-[160px] truncate py-2.5 pr-2 font-mono text-xs text-slate-500">
                      {row.href}
                    </td>
                    <td className="py-2.5 pr-2 text-slate-500">
                      {row.parent?.label ?? "—"}
                    </td>
                    <td className="py-2.5 pr-2">
                      {row.is_active ? "เปิด" : "ปิด"}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => openEdit(row)}
                      >
                        แก้ไข
                      </button>{" "}
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => removeNav(row)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      ยังไม่มีเมนู — กดเพิ่ม หรือรัน seeder
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-heading text-lg font-bold">
              {editing ? "แก้ไขเมนู" : "เพิ่มเมนู"}
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-600">ชื่อ</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">ลิงก์</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                placeholder="/products"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                อยู่ภายใต้เมนู (submenu)
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={form.parent_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parent_id: e.target.value }))
                }
              >
                <option value="">— เมนูหลัก —</option>
                {parentOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  ลำดับ
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  สถานะ
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.value }))
                  }
                >
                  <option value="1">เปิด</option>
                  <option value="0">ปิด</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={saving || !form.label.trim()}
                onClick={saveNav}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
