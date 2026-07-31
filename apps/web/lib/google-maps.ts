export type LatLng = { lat: number; lng: number };

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type MapGeometry =
  | { type: "rectangle"; bounds: MapBounds }
  | { type: "polygon"; paths: LatLng[] };

type GoogleMapsWindow = Window & {
  google?: {
    maps: {
      Map: new (el: HTMLElement, opts?: Record<string, unknown>) => GoogleMap;
      LatLngBounds: new () => GoogleLatLngBounds;
      Rectangle: new (opts?: Record<string, unknown>) => GoogleRectangle;
      Polygon: new (opts?: Record<string, unknown>) => GooglePolygon;
      MapTypeId: { SATELLITE: string; HYBRID: string; ROADMAP: string };
      drawing: {
        OverlayType: { RECTANGLE: string; POLYGON: string };
        DrawingManager: new (opts?: Record<string, unknown>) => GoogleDrawingManager;
      };
      event: {
        clearInstanceListeners: (instance: unknown) => void;
      };
    };
  };
};

export type GoogleMap = {
  setCenter: (latLng: LatLng) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: GoogleLatLngBounds) => void;
};

export type GoogleLatLngBounds = {
  extend: (point: LatLng) => void;
  getNorthEast: () => { lat: () => number; lng: () => number };
  getSouthWest: () => { lat: () => number; lng: () => number };
};

export type GoogleRectangle = {
  setMap: (map: GoogleMap | null) => void;
  getBounds: () => GoogleLatLngBounds | null;
  addListener: (event: string, handler: () => void) => { remove: () => void };
};

export type GooglePolygon = {
  setMap: (map: GoogleMap | null) => void;
  getPath: () => {
    getLength: () => number;
    getAt: (i: number) => { lat: () => number; lng: () => number };
    addListener: (event: string, handler: () => void) => { remove: () => void };
  };
  addListener: (event: string, handler: () => void) => { remove: () => void };
};

export type GoogleDrawingManager = {
  setMap: (map: GoogleMap | null) => void;
  setDrawingMode: (mode: string | null) => void;
  addListener: (
    event: string,
    handler: (e: { overlay: GoogleRectangle | GooglePolygon; type: string }) => void,
  ) => { remove: () => void };
};

let loadingPromise: Promise<void> | null = null;

export function getGoogleMapsApiKey(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";
}

export function getGoogleMaps() {
  return (window as GoogleMapsWindow).google?.maps;
}

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window unavailable"));
  }
  const maps = getGoogleMaps();
  if (maps?.drawing) {
    return Promise.resolve();
  }
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-google-maps]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("โหลด Google Maps ไม่สำเร็จ")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=drawing&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "1";
    script.onload = () => resolve();
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("โหลด Google Maps ไม่สำเร็จ — ตรวจ API key"));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function geometryFromRectangle(
  rect: GoogleRectangle,
): MapGeometry | null {
  const b = rect.getBounds();
  if (!b) return null;
  const ne = b.getNorthEast();
  const sw = b.getSouthWest();
  return {
    type: "rectangle",
    bounds: {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng(),
    },
  };
}

export function geometryFromPolygon(
  polygon: GooglePolygon,
): MapGeometry | null {
  const path = polygon.getPath();
  const paths: LatLng[] = [];
  for (let i = 0; i < path.getLength(); i += 1) {
    const p = path.getAt(i);
    paths.push({ lat: p.lat(), lng: p.lng() });
  }
  if (paths.length < 3) return null;
  return { type: "polygon", paths };
}
