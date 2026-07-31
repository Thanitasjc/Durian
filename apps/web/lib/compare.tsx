"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const COMPARE_MAX = 4;

export type CompareItem = {
  productId: number;
  slug: string;
  name: string;
  name_en: string | null;
  description: string | null;
  product_type: string;
  badge: string | null;
  price: number | null;
  unit: string;
  image_url: string | null;
  rating: number;
  review_count: number;
};

type ToggleResult = "added" | "removed" | "full";

type CompareContextValue = {
  items: CompareItem[];
  count: number;
  max: number;
  has: (productId: number) => boolean;
  toggle: (item: CompareItem) => ToggleResult;
  add: (item: CompareItem) => ToggleResult;
  remove: (productId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "auragold-compare";

const CompareContext = createContext<CompareContextValue | null>(null);

function loadCompare(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompareItem[];
    return Array.isArray(parsed) ? parsed.slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadCompare());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const has = useCallback(
    (productId: number) => items.some((p) => p.productId === productId),
    [items],
  );

  const add = useCallback((item: CompareItem): ToggleResult => {
    let result: ToggleResult = "added";
    setItems((prev) => {
      if (prev.some((p) => p.productId === item.productId)) {
        result = "removed";
        return prev;
      }
      if (prev.length >= COMPARE_MAX) {
        result = "full";
        return prev;
      }
      result = "added";
      return [...prev, item];
    });
    return result;
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const toggle = useCallback((item: CompareItem): ToggleResult => {
    let result: ToggleResult = "added";
    setItems((prev) => {
      if (prev.some((p) => p.productId === item.productId)) {
        result = "removed";
        return prev.filter((p) => p.productId !== item.productId);
      }
      if (prev.length >= COMPARE_MAX) {
        result = "full";
        return prev;
      }
      result = "added";
      return [...prev, item];
    });
    return result;
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.length;

  const value = useMemo(
    () => ({
      items,
      count,
      max: COMPARE_MAX,
      has,
      toggle,
      add,
      remove,
      clear,
    }),
    [items, count, has, toggle, add, remove, clear],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export function toCompareItem(product: {
  id: number;
  slug: string;
  name: string;
  name_en?: string | null;
  description?: string | null;
  product_type: string;
  badge?: string | null;
  price: number | null;
  unit: string;
  image_url: string | null;
  rating?: number;
  review_count?: number;
}): CompareItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    name_en: product.name_en ?? null,
    description: product.description ?? null,
    product_type: product.product_type,
    badge: product.badge ?? null,
    price: product.price,
    unit: product.unit,
    image_url: product.image_url,
    rating: product.rating ?? 0,
    review_count: product.review_count ?? 0,
  };
}
