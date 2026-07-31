"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { OrchardGoogleMap } from "@/components/admin/OrchardGoogleMap";
import { adminFetch } from "@/lib/admin-api";
import type { MapGeometry } from "@/lib/google-maps";
import { toPublicMediaUrl } from "@/lib/media";

type Farm = {
  id: number;
  name: string;
  code: string;
  location?: string | null;
  map_image_url?: string | null;
  map_provider?: string | null;
  map_lat?: number | null;
  map_lng?: number | null;
  map_zoom?: number | null;
};

type Plot = {
  id: number;
  farm_id: number;
  code: string;
  name: string;
  variety?: string | null;
  tree_count?: number;
  fruit_status?: string | null;
  development_percent?: number;
  expected_harvest_date?: string | null;
  notes?: string | null;
  map_x?: number | null;
  map_y?: number | null;
  map_w?: number | null;
  map_h?: number | null;
  map_geometry?: MapGeometry | null;
  soil_moisture?: number | null;
  alert_level?: string | null;
};

type Rect = { x: number; y: number; w: number; h: number };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function defaultRect(index: number, total: number): Rect {
  const cols = Math.min(3, Math.max(1, total));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const w = 28;
  const h = 22;
  const gap = 4;
  return {
    x: 8 + col * (w + gap),
    y: 12 + row * (h + gap),
    w,
    h,
  };
}

function plotRect(plot: Plot, index: number, total: number): Rect {
  if (
    plot.map_x != null &&
    plot.map_y != null &&
    plot.map_w != null &&
    plot.map_h != null
  ) {
    return {
      x: Number(plot.map_x),
      y: Number(plot.map_y),
      w: Number(plot.map_w),
      h: Number(plot.map_h),
    };
  }
  return defaultRect(index, total);
}

function alertStyles(level?: string | null) {
  if (level === "critical") {
    return {
      border: "border-red-500",
      badge: "bg-red-600 text-white",
      label: "Critical",
    };
  }
  if (level === "warning") {
    return {
      border: "border-amber-400",
      badge: "bg-amber-400 text-amber-950",
      label: "Warning",
    };
  }
  return {
    border: "border-emerald-500/70",
    badge: "bg-primary/90 text-white",
    label: "OK",
  };
}

export default function OrchardAdminPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmId, setFarmId] = useState<number | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Record<number, Rect>>({});
  const [mapUrl, setMapUrl] = useState("");
  const [provider, setProvider] = useState<"image" | "google">("image");
  const [drawMode, setDrawMode] = useState<"rectangle" | "polygon" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const geoSaveTimer = useRef<number | null>(null);
  const dragRef = useRef<{
    plotId: number;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origin: Rect;
  } | null>(null);

  const SAMPLE_MAP = "/samples/orchard-map.svg";

  const farm = farms.find((f) => f.id === farmId) ?? null;
  const selected = plots.find((p) => p.id === selectedId) ?? null;
  const displayMap = mapUrl || SAMPLE_MAP;
  const usingSampleMap = !mapUrl;

  const loadFarms = useCallback(async () => {
    const res = await adminFetch<{ data: Farm[] }>("/farms");
    setFarms(res.data);
    if (!farmId && res.data.length) {
      setFarmId(res.data[0].id);
    }
  }, [farmId]);

  const loadPlots = useCallback(async (id: number) => {
    const res = await adminFetch<{ data: Plot[] }>(`/plots?farm_id=${id}`);
    setPlots(res.data);
    setSelectedId((prev) =>
      prev && res.data.some((p) => p.id === prev)
        ? prev
        : (res.data[0]?.id ?? null),
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFarms()
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [loadFarms]);

  useEffect(() => {
    if (!farmId) return;
    setError(null);
    loadPlots(farmId).catch((e) =>
      setError(e instanceof Error ? e.message : "โหลดแปลงไม่สำเร็จ"),
    );
  }, [farmId, loadPlots]);

  useEffect(() => {
    setMapUrl(farm?.map_image_url ? toPublicMediaUrl(farm.map_image_url) : "");
    setProvider(farm?.map_provider === "google" ? "google" : "image");
  }, [farm?.map_image_url, farm?.map_provider, farm?.id]);

  const saveGeometry = useCallback((plotId: number, geometry: MapGeometry) => {
    setPlots((prev) =>
      prev.map((p) => (p.id === plotId ? { ...p, map_geometry: geometry } : p)),
    );
    if (geoSaveTimer.current) window.clearTimeout(geoSaveTimer.current);
    geoSaveTimer.current = window.setTimeout(async () => {
      try {
        await adminFetch(`/plots/${plotId}`, {
          method: "PUT",
          body: JSON.stringify({ map_geometry: geometry }),
        });
        setMessage("บันทึกโซนบน Google Maps แล้ว");
      } catch (e) {
        setError(e instanceof Error ? e.message : "บันทึกโซนไม่สำเร็จ");
      }
    }, 450);
  }, []);

  async function saveProvider(next: "image" | "google") {
    if (!farmId) return;
    setProvider(next);
    setEditMode(false);
    setDrawMode(null);
    setSaving(true);
    setMessage(null);
    try {
      await adminFetch(`/farms/${farmId}`, {
        method: "PUT",
        body: JSON.stringify({ map_provider: next }),
      });
      setFarms((prev) =>
        prev.map((f) =>
          f.id === farmId ? { ...f, map_provider: next } : f,
        ),
      );
      setMessage(
        next === "google"
          ? "สลับเป็น Google Maps แล้ว"
          : "สลับเป็นรูปแผนที่แล้ว",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function saveGoogleCoords(patch: {
    map_lat?: number;
    map_lng?: number;
    map_zoom?: number;
  }) {
    if (!farmId) return;
    setSaving(true);
    try {
      const res = await adminFetch<{ data: Farm }>(`/farms/${farmId}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setFarms((prev) =>
        prev.map((f) => (f.id === farmId ? { ...f, ...res.data } : f)),
      );
      setMessage("บันทึกพิกัด Google Maps แล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกพิกัดไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!editMode) return;
    const next: Record<number, Rect> = {};
    plots.forEach((p, i) => {
      next[p.id] = plotRect(p, i, plots.length);
    });
    setDraft(next);
  }, [editMode, plots]);

  const criticalCount = useMemo(
    () => plots.filter((p) => p.alert_level === "critical").length,
    [plots],
  );
  const warningCount = useMemo(
    () => plots.filter((p) => p.alert_level === "warning").length,
    [plots],
  );

  async function saveMapImage(url: string) {
    if (!farmId) return;
    setMapUrl(url);
    setSaving(true);
    setMessage(null);
    try {
      await adminFetch(`/farms/${farmId}`, {
        method: "PUT",
        body: JSON.stringify({ map_image_url: url }),
      });
      setFarms((prev) =>
        prev.map((f) => (f.id === farmId ? { ...f, map_image_url: url } : f)),
      );
      setMessage("บันทึกรูปแผนที่แล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกรูปไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function saveLayout() {
    if (!farmId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await Promise.all(
        plots.map((p) => {
          const r = draft[p.id];
          if (!r) return Promise.resolve();
          return adminFetch(`/plots/${p.id}`, {
            method: "PUT",
            body: JSON.stringify({
              map_x: Math.round(r.x * 100) / 100,
              map_y: Math.round(r.y * 100) / 100,
              map_w: Math.round(r.w * 100) / 100,
              map_h: Math.round(r.h * 100) / 100,
            }),
          });
        }),
      );
      await loadPlots(farmId);
      setEditMode(false);
      setMessage("บันทึกตำแหน่งแปลงแล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกตำแหน่งไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function savePlotMeta(patch: Partial<Plot>) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await adminFetch<{ data: Plot }>(`/plots/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      setPlots((prev) =>
        prev.map((p) => (p.id === selected.id ? { ...p, ...res.data } : p)),
      );
      setMessage("อัปเดตข้อมูลแปลงแล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปเดตไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function onZonePointerDown(
    e: React.PointerEvent,
    plotId: number,
    mode: "move" | "resize",
  ) {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    const origin = draft[plotId];
    if (!origin || !mapRef.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      plotId,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...origin },
    };
  }

  function onMapPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;

    setDraft((prev) => {
      const o = drag.origin;
      if (drag.mode === "move") {
        return {
          ...prev,
          [drag.plotId]: {
            ...o,
            x: clamp(o.x + dx, 0, 100 - o.w),
            y: clamp(o.y + dy, 0, 100 - o.h),
          },
        };
      }
      return {
        ...prev,
        [drag.plotId]: {
          ...o,
          w: clamp(o.w + dx, 8, 100 - o.x),
          h: clamp(o.h + dy, 8, 100 - o.y),
        },
      };
    });
  }

  function onMapPointerUp() {
    dragRef.current = null;
  }

  if (loading) {
    return <p className="text-sm text-slate-500">กำลังโหลดแผนที่แปลง...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-800">
            ดูแปลงปลูก
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            อัปโหลดรูปแผนที่ ลากจัดวางโซนแปลง และดูสถานะบนแผนที่
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={farmId ?? ""}
            onChange={(e) => setFarmId(Number(e.target.value))}
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white text-sm">
            <button
              type="button"
              onClick={() => saveProvider("image")}
              className={`px-3 py-2 font-semibold ${
                provider === "image"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              รูปแผนที่
            </button>
            <button
              type="button"
              onClick={() => saveProvider("google")}
              className={`px-3 py-2 font-semibold ${
                provider === "google"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Google Maps
            </button>
          </div>
          {provider === "image" || provider === "google" ? (
            !editMode ? (
              <button
                type="button"
                onClick={() => {
                  setEditMode(true);
                  if (provider === "google") setDrawMode("rectangle");
                }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                จัดวางโซน
              </button>
            ) : (
              <>
                {provider === "google" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDrawMode("rectangle")}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                        drawMode === "rectangle"
                          ? "bg-primary text-white"
                          : "border border-slate-200 bg-white"
                      }`}
                    >
                      Rectangle
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawMode("polygon")}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                        drawMode === "polygon"
                          ? "bg-primary text-white"
                          : "border border-slate-200 bg-white"
                      }`}
                    >
                      Polygon
                    </button>
                  </>
                ) : null}
                {provider === "image" ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveLayout}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "กำลังบันทึก..." : "บันทึกตำแหน่ง"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setDrawMode(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  เสร็จสิ้น
                </button>
              </>
            )
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {!farms.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          ยังไม่มีฟาร์ม — สร้างที่เมนู “จัดการฟาร์ม” ก่อน
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {provider === "image" ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <ImageUploadField
                  label="รูปแผนที่แปลง (พื้นหลัง)"
                  value={mapUrl}
                  collection="farms"
                  onChange={saveMapImage}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-600">
                  พิกัด Google Maps (ดาวเทียม)
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="text-xs text-slate-500">
                    Latitude
                    <input
                      type="number"
                      step="0.000001"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      defaultValue={farm?.map_lat ?? 12.6113}
                      key={`lat-${farm?.id}-${farm?.map_lat}`}
                      onBlur={(e) =>
                        saveGoogleCoords({ map_lat: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="text-xs text-slate-500">
                    Longitude
                    <input
                      type="number"
                      step="0.000001"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      defaultValue={farm?.map_lng ?? 102.1038}
                      key={`lng-${farm?.id}-${farm?.map_lng}`}
                      onBlur={(e) =>
                        saveGoogleCoords({ map_lng: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="text-xs text-slate-500">
                    Zoom
                    <input
                      type="number"
                      min={3}
                      max={21}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      defaultValue={farm?.map_zoom ?? 16}
                      key={`zoom-${farm?.id}-${farm?.map_zoom}`}
                      onBlur={(e) =>
                        saveGoogleCoords({ map_zoom: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  คัดลอกพิกัดจาก Google Maps ได้ (คลิกขวาบนแผนที่ → พิกัด)
                </p>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="font-heading text-sm font-bold text-primary">
                    {provider === "google"
                      ? "Google Maps · Satellite"
                      : "Irrigation / Plot Map"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {farm?.name} · {plots.length} แปลง
                    {provider === "google"
                      ? editMode
                        ? " · วาด/ลาก Rectangle หรือ Polygon บนแผนที่"
                        : " · ดาวเทียมแบบโต้ตอบได้"
                      : ""}
                    {provider === "image" && editMode
                      ? " · โหมดจัดวาง (ลากกล่อง / มุมขวาล่างย่อขยาย)"
                      : ""}
                    {provider === "image" && usingSampleMap
                      ? " · ใช้รูปตัวอย่าง"
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {criticalCount > 0 ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-700">
                      {criticalCount} Critical
                    </span>
                  ) : null}
                  {warningCount > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                      {warningCount} Warning
                    </span>
                  ) : null}
                </div>
              </div>

              {provider === "google" && farm ? (
                <OrchardGoogleMap
                  center={{
                    lat: Number(farm.map_lat ?? 12.6113),
                    lng: Number(farm.map_lng ?? 102.1038),
                  }}
                  zoom={Number(farm.map_zoom ?? 16)}
                  plots={plots}
                  selectedId={selectedId}
                  editMode={editMode}
                  drawMode={drawMode}
                  onSelect={setSelectedId}
                  onGeometryChange={saveGeometry}
                />
              ) : (
                <div
                  ref={mapRef}
                  className={`relative aspect-[16/10] bg-slate-200 ${
                    editMode ? "cursor-crosshair touch-none" : ""
                  }`}
                  onPointerMove={onMapPointerMove}
                  onPointerUp={onMapPointerUp}
                  onPointerCancel={onMapPointerUp}
                >
                  {displayMap ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayMap}
                      alt="แผนที่แปลง"
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                      ยังไม่มีรูปแผนที่ — อัปโหลดด้านบน
                    </div>
                  )}

                  {plots.map((plot, index) => {
                    const rect = editMode
                      ? draft[plot.id] ?? plotRect(plot, index, plots.length)
                      : plotRect(plot, index, plots.length);
                    const styles = alertStyles(plot.alert_level);
                    const active = selectedId === plot.id;

                    return (
                      <div
                        key={plot.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(plot.id)}
                        onPointerDown={(e) =>
                          editMode
                            ? onZonePointerDown(e, plot.id, "move")
                            : undefined
                        }
                        className={`absolute rounded-lg border-2 bg-white/15 backdrop-blur-[1px] transition ${
                          styles.border
                        } ${active ? "ring-2 ring-primary ring-offset-1" : ""} ${
                          editMode
                            ? "cursor-move"
                            : "cursor-pointer hover:bg-white/25"
                        }`}
                        style={{
                          left: `${rect.x}%`,
                          top: `${rect.y}%`,
                          width: `${rect.w}%`,
                          height: `${rect.h}%`,
                        }}
                      >
                        <div className="flex h-full flex-col justify-between p-2">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-[11px] font-bold text-white drop-shadow">
                              {plot.code}
                            </p>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${styles.badge}`}
                            >
                              {styles.label}
                            </span>
                          </div>
                          <p className="text-[10px] font-semibold text-white drop-shadow line-clamp-2">
                            {plot.name}
                          </p>
                        </div>
                        {editMode ? (
                          <span
                            onPointerDown={(e) =>
                              onZonePointerDown(e, plot.id, "resize")
                            }
                            className="absolute right-0 bottom-0 h-3 w-3 cursor-se-resize rounded-tl bg-primary"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                รายการแปลง
              </p>
              <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">
                {plots.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                        selectedId === p.id
                          ? "bg-primary/10 font-semibold text-primary"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        {p.code} · {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.soil_moisture != null ? `${p.soil_moisture}%` : "—"}
                      </span>
                    </button>
                  </li>
                ))}
                {!plots.length ? (
                  <li className="text-sm text-slate-400">
                    ยังไม่มีแปลง — เพิ่มที่เมนู “แปลงปลูก”
                  </li>
                ) : null}
              </ul>
            </div>

            {selected ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading text-lg font-bold text-primary">
                      {selected.name}
                    </p>
                    <p className="text-xs text-slate-500">{selected.code}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      alertStyles(selected.alert_level).badge
                    }`}
                  >
                    {alertStyles(selected.alert_level).label}
                  </span>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-2 border-b border-slate-50 py-1.5">
                    <dt className="text-slate-500">พันธุ์</dt>
                    <dd className="font-medium">{selected.variety || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-slate-50 py-1.5">
                    <dt className="text-slate-500">จำนวนต้น</dt>
                    <dd className="font-medium">{selected.tree_count ?? 0}</dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-slate-50 py-1.5">
                    <dt className="text-slate-500">สถานะผล</dt>
                    <dd className="font-medium">
                      {selected.fruit_status || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 border-b border-slate-50 py-1.5">
                    <dt className="text-slate-500">พัฒนา</dt>
                    <dd className="font-medium">
                      {selected.development_percent ?? 0}%
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <label className="block text-xs font-semibold text-slate-600">
                    ความชื้นดิน (%)
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      defaultValue={selected.soil_moisture ?? ""}
                      key={`m-${selected.id}-${selected.soil_moisture}`}
                      onBlur={(e) => {
                        const v =
                          e.target.value === ""
                            ? null
                            : Number(e.target.value);
                        savePlotMeta({ soil_moisture: v as number | null });
                      }}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-600">
                    ระดับแจ้งเตือน
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={selected.alert_level || "none"}
                      onChange={(e) =>
                        savePlotMeta({ alert_level: e.target.value })
                      }
                    >
                      <option value="none">ปกติ</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
