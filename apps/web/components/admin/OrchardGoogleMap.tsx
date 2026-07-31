"use client";

import { useEffect, useRef, useState } from "react";
import {
  geometryFromPolygon,
  geometryFromRectangle,
  getGoogleMaps,
  getGoogleMapsApiKey,
  loadGoogleMaps,
  type GoogleDrawingManager,
  type GoogleMap,
  type GooglePolygon,
  type GoogleRectangle,
  type MapGeometry,
} from "@/lib/google-maps";

export type GooglePlot = {
  id: number;
  code: string;
  name: string;
  alert_level?: string | null;
  map_geometry?: MapGeometry | null;
};

type Props = {
  center: { lat: number; lng: number };
  zoom: number;
  plots: GooglePlot[];
  selectedId: number | null;
  editMode: boolean;
  drawMode: "rectangle" | "polygon" | null;
  onSelect: (plotId: number) => void;
  onGeometryChange: (plotId: number, geometry: MapGeometry) => void;
};

function strokeColor(level?: string | null) {
  if (level === "critical") return "#ba1a1a";
  if (level === "warning") return "#b45309";
  return "#154212";
}

function fillColor(level?: string | null) {
  if (level === "critical") return "#ba1a1a";
  if (level === "warning") return "#f59e0b";
  return "#3b6934";
}

export function OrchardGoogleMap({
  center,
  zoom,
  plots,
  selectedId,
  editMode,
  drawMode,
  onSelect,
  onGeometryChange,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const overlaysRef = useRef<Map<number, GoogleRectangle | GooglePolygon>>(
    new Map(),
  );
  const drawingRef = useRef<GoogleDrawingManager | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  const apiKey = getGoogleMapsApiKey();

  useEffect(() => {
    if (!apiKey) {
      setStatus("error");
      setError(
        "ยังไม่มี API key — ใส่ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ใน apps/web/.env.local",
      );
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !hostRef.current) return;
        const gmaps = getGoogleMaps();
        if (!gmaps) throw new Error("Google Maps ไม่พร้อม");
        mapRef.current = new gmaps.Map(hostRef.current, {
          center,
          zoom,
          mapTypeId: gmaps.MapTypeId.SATELLITE,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
        });
        setStatus("ready");
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : "โหลดแผนที่ไม่สำเร็จ");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (!mapRef.current || status !== "ready") return;
    mapRef.current.setCenter(center);
    mapRef.current.setZoom(zoom);
  }, [center.lat, center.lng, zoom, status]);

  useEffect(() => {
    const gmaps = getGoogleMaps();
    if (!mapRef.current || !gmaps || status !== "ready") return;
    const map = mapRef.current;

    overlaysRef.current.forEach((o) => {
      gmaps.event.clearInstanceListeners(o);
      o.setMap(null);
    });
    overlaysRef.current.clear();

    const bounds = new gmaps.LatLngBounds();
    let hasGeom = false;

    plots.forEach((plot) => {
      const geom = plot.map_geometry;
      if (!geom) return;

      const selected = plot.id === selectedId;
      const editable = editMode && selected;
      const common = {
        strokeColor: strokeColor(plot.alert_level),
        strokeOpacity: 0.95,
        strokeWeight: selected ? 3 : 2,
        fillColor: fillColor(plot.alert_level),
        fillOpacity: selected ? 0.35 : 0.22,
        editable,
        draggable: editable,
        map,
      };

      if (geom.type === "rectangle" && geom.bounds) {
        const rect = new gmaps.Rectangle({
          ...common,
          bounds: geom.bounds,
        });
        const sync = () => {
          const g = geometryFromRectangle(rect);
          if (g) onGeometryChange(plot.id, g);
        };
        rect.addListener("click", () => onSelect(plot.id));
        rect.addListener("bounds_changed", () => {
          if (editable) sync();
        });
        rect.addListener("dragend", sync);
        overlaysRef.current.set(plot.id, rect);
        bounds.extend({ lat: geom.bounds.north, lng: geom.bounds.east });
        bounds.extend({ lat: geom.bounds.south, lng: geom.bounds.west });
        hasGeom = true;
      }

      if (geom.type === "polygon" && geom.paths?.length) {
        const polygon = new gmaps.Polygon({
          ...common,
          paths: geom.paths,
        });
        const sync = () => {
          const g = geometryFromPolygon(polygon);
          if (g) onGeometryChange(plot.id, g);
        };
        polygon.addListener("click", () => onSelect(plot.id));
        polygon.getPath().addListener("set_at", sync);
        polygon.getPath().addListener("insert_at", sync);
        polygon.addListener("dragend", sync);
        overlaysRef.current.set(plot.id, polygon);
        geom.paths.forEach((p) => bounds.extend(p));
        hasGeom = true;
      }
    });

    if (hasGeom && !editMode) {
      map.fitBounds(bounds);
    }
  }, [plots, selectedId, editMode, status, onSelect, onGeometryChange]);

  useEffect(() => {
    const gmaps = getGoogleMaps();
    if (!mapRef.current || !gmaps || status !== "ready") return;

    if (drawingRef.current) {
      drawingRef.current.setMap(null);
      gmaps.event.clearInstanceListeners(drawingRef.current);
      drawingRef.current = null;
    }

    if (!editMode || !drawMode || !selectedId) return;

    const manager = new gmaps.drawing.DrawingManager({
      drawingMode:
        drawMode === "rectangle"
          ? gmaps.drawing.OverlayType.RECTANGLE
          : gmaps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      rectangleOptions: {
        fillColor: "#3b6934",
        fillOpacity: 0.3,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        draggable: true,
      },
      polygonOptions: {
        fillColor: "#3b6934",
        fillOpacity: 0.3,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        draggable: true,
      },
    });
    manager.setMap(mapRef.current);
    drawingRef.current = manager;

    const listener = manager.addListener("overlaycomplete", (e) => {
      const overlay = e.overlay;
      let geom: MapGeometry | null = null;
      if (e.type === "rectangle") {
        geom = geometryFromRectangle(overlay as GoogleRectangle);
      } else if (e.type === "polygon") {
        geom = geometryFromPolygon(overlay as GooglePolygon);
      }
      overlay.setMap(null);
      manager.setDrawingMode(null);
      if (geom && selectedId) {
        onGeometryChange(selectedId, geom);
      }
    });

    return () => {
      listener.remove();
      manager.setMap(null);
    };
  }, [editMode, drawMode, selectedId, status, onGeometryChange]);

  if (!apiKey) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 bg-slate-100 px-6 text-center">
        <p className="text-sm font-semibold text-slate-700">
          ต้องมี Google Maps API Key
        </p>
        <p className="max-w-md text-xs leading-relaxed text-slate-500">
          สร้าง Key ที่ Google Cloud Console (เปิด Maps JavaScript API) แล้วใส่ใน{" "}
          <code className="rounded bg-white px-1">apps/web/.env.local</code>:
        </p>
        <pre className="rounded-xl bg-slate-900 px-4 py-3 text-left text-[11px] text-emerald-300">
          {`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here`}
        </pre>
        <p className="text-[11px] text-slate-400">
          ตัวอย่างเท่านั้น — ใช้ key จริง แล้วรีสตาร์ท{" "}
          <code>npm run dev</code>
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] bg-slate-200">
      <div ref={hostRef} className="absolute inset-0" />
      {status === "loading" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-slate-500">
          กำลังโหลด Google Maps...
        </div>
      ) : null}
      {status === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 px-6 text-center text-sm text-red-600">
          {error}
        </div>
      ) : null}
      {editMode && !selectedId ? (
        <div className="absolute top-3 left-3 rounded-lg bg-black/70 px-3 py-2 text-xs text-white">
          เลือกแปลงทางขวาก่อน แล้วค่อยวาด Rectangle / Polygon
        </div>
      ) : null}
      {editMode && selectedId && drawMode ? (
        <div className="absolute top-3 left-3 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white">
          โหมดวาด {drawMode === "rectangle" ? "Rectangle" : "Polygon"} — ลากบนแผนที่
        </div>
      ) : null}
    </div>
  );
}
