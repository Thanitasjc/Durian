export type Product = {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  description: string | null;
  tagline?: string | null;
  seller_name?: string | null;
  seller_phone?: string | null;
  product_type: string;
  badge: string | null;
  price: number | null;
  unit: string;
  stock_qty?: number | null;
  inventory_item_id?: number | null;
  inventory_qty?: number | null;
  inventory_unit?: string | null;
  weight_kg?: number | null;
  image_url: string | null;
  gallery_images?: string[] | null;
  rating: number;
  review_count: number;
  is_featured?: boolean;
  is_hot?: boolean;
  updated_at?: string | null;
  created_at?: string | null;
};

export type TraceStep = {
  step: string;
  title: string;
  detail: string;
};

export type SiteSection = {
  id: number;
  key: string;
  title: string | null;
  eyebrow: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_link: string | null;
  cta_label_2: string | null;
  cta_link_2: string | null;
  meta: Record<string, unknown> | null;
  sort_order: number;
  is_active: boolean;
};

export type HeroSlide = {
  id?: number;
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  body?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  cta_label?: string | null;
  cta_link?: string | null;
  cta_label_2?: string | null;
  cta_link_2?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type HomePayload = {
  sections: Record<string, SiteSection>;
  featured_products: Product[];
  hot_products?: Product[];
  hero_slides?: HeroSlide[];
};

const serverApiBase =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function getApiBase(isServer = false): string {
  if (isServer) {
    return `${serverApiBase}/api/v1/public`;
  }
  return "/api/v1/public";
}

export async function fetchHome(): Promise<HomePayload> {
  try {
    const res = await fetch(`${getApiBase(true)}/home`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { sections: {}, featured_products: [], hot_products: [], hero_slides: [] };
    }
    const json = (await res.json()) as { data: HomePayload };
    return json.data;
  } catch {
    return { sections: {}, featured_products: [], hot_products: [], hero_slides: [] };
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${getApiBase(true)}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as { data: Product[] };
    return json.data;
  } catch {
    return [];
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${getApiBase(true)}/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return null;
    }
    const json = (await res.json()) as { data: Product };
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchBranding(): Promise<{
  logo_url: string | null;
  brand_primary: string;
  brand_accent: string;
  brand_mode: string;
}> {
  try {
    const res = await fetch(`${getApiBase(true)}/branding`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        logo_url: null,
        brand_primary: "AuraGold",
        brand_accent: "Durian",
        brand_mode: "text",
      };
    }
    const json = (await res.json()) as {
      data: {
        logo_url: string | null;
        brand_primary: string;
        brand_accent: string;
        brand_mode: string;
      };
    };
    return {
      logo_url: json.data.logo_url ?? null,
      brand_primary: json.data.brand_primary || "AuraGold",
      brand_accent: json.data.brand_accent || "Durian",
      brand_mode: json.data.brand_mode || "text",
    };
  } catch {
    return {
      logo_url: null,
      brand_primary: "AuraGold",
      brand_accent: "Durian",
      brand_mode: "text",
    };
  }
}

export function formatPrice(price: number | null, unit: string): string {
  if (price == null) {
    return "สอบถามราคา";
  }
  const unitLabel =
    unit === "kg" ? "กก." : unit === "pack" ? "แพ็ก" : unit;
  return `฿${price.toLocaleString("th-TH")} / ${unitLabel}`;
}

export const productTypeLabel: Record<string, string> = {
  fresh: "ทุเรียนสด",
  flesh: "เนื้อทุเรียนสด",
  frozen: "ทุเรียนแช่แข็ง",
  dried: "ทุเรียนอบแห้ง",
};
