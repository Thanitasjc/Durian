"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toPublicMediaUrl } from "@/lib/media";

export type Branding = {
  logo_url: string | null;
  brand_primary: string;
  brand_accent: string;
  brand_mode: "text" | "logo" | "both" | string;
};

export const DEFAULT_BRANDING: Branding = {
  logo_url: null,
  brand_primary: "AuraGold",
  brand_accent: "Durian",
  brand_mode: "text",
};

function normalizeBranding(data: Partial<Branding> | null | undefined): Branding {
  return {
    logo_url: data?.logo_url ?? null,
    brand_primary:
      data?.brand_primary != null && data.brand_primary !== ""
        ? String(data.brand_primary)
        : "AuraGold",
    brand_accent:
      data?.brand_accent != null && data.brand_accent !== ""
        ? String(data.brand_accent)
        : "Durian",
    brand_mode: String(data?.brand_mode || "text"),
  };
}

const BrandingContext = createContext<Branding | null>(null);

export function BrandingProvider({
  initial,
  children,
}: {
  initial: Branding;
  children: ReactNode;
}) {
  const [branding, setBranding] = useState<Branding>(() =>
    normalizeBranding(initial),
  );

  useEffect(() => {
    setBranding(normalizeBranding(initial));
  }, [initial]);

  // Soft refresh after mount (admin may have changed settings)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/public/branding", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json?.data) {
          const raw = json.data as Partial<Branding>;
          setBranding(
            normalizeBranding({
              ...raw,
              logo_url: raw.logo_url
                ? toPublicMediaUrl(raw.logo_url) || raw.logo_url
                : raw.logo_url ?? null,
            }),
          );
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => branding, [branding]);

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}

export function useBranding(): Branding {
  const ctx = useContext(BrandingContext);
  return ctx ?? DEFAULT_BRANDING;
}

type Props = {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  accentClassName?: string;
  onNavigate?: () => void;
};

export function SiteBrandLink({
  className = "font-heading text-lg font-bold text-primary xl:text-xl",
  imageClassName = "h-12 w-auto max-w-[220px] object-contain xl:h-14",
  textClassName,
  accentClassName = "text-primary-light",
  onNavigate,
}: Props) {
  const branding = useBranding();
  const mode = branding.brand_mode || "text";
  const logo = branding.logo_url
    ? toPublicMediaUrl(branding.logo_url)
    : "";
  const showLogo = !!logo && (mode === "logo" || mode === "both");
  const showText =
    mode === "both" ||
    mode === "text" ||
    (mode === "logo" && !logo);

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 ${className}`}
      onClick={onNavigate}
    >
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={`${branding.brand_primary} ${branding.brand_accent}`.trim()}
          className={imageClassName}
        />
      ) : null}
      {showText ? (
        <span className={textClassName}>
          {branding.brand_primary}
          {branding.brand_accent ? (
            <>
              {" "}
              <span className={accentClassName}>
                {branding.brand_accent}
              </span>
            </>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
