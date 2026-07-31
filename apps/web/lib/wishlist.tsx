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

export type WishlistItem = {
  productId: number;
  slug: string;
  name: string;
  price: number | null;
  unit: string;
  image_url: string | null;
};

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  has: (productId: number) => boolean;
  toggle: (item: WishlistItem) => void;
  add: (item: WishlistItem) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "auragold-wishlist";

const WishlistContext = createContext<WishlistContextValue | null>(null);

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadWishlist());
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

  const add = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.productId === item.productId)) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.productId === item.productId)) {
        return prev.filter((p) => p.productId !== item.productId);
      }
      return [...prev, item];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.length;

  const value = useMemo(
    () => ({ items, count, has, toggle, add, remove, clear }),
    [items, count, has, toggle, add, remove, clear],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
