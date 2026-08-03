"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CartLink } from "@/components/CartLink";
import { CompareLink } from "@/components/CompareLink";
import { SiteBrandLink } from "@/components/SiteBrand";
import { WishlistLink } from "@/components/WishlistLink";

type NavChild = { id: number; label: string; href: string };
type NavItem = {
  id: number;
  label: string;
  href: string;
  children: NavChild[];
};

type Toolbar = {
  account: boolean;
  search: boolean;
  compare: boolean;
  wishlist: boolean;
  cart: boolean;
};

const DEFAULT_NAV: NavItem[] = [
  { id: 1, label: "หน้าแรก", href: "/", children: [] },
  {
    id: 2,
    label: "สินค้า",
    href: "/products",
    children: [
      { id: 21, label: "ทุเรียนสด", href: "/products?type=fresh" },
      { id: 22, label: "เนื้อสด", href: "/products?type=flesh" },
      { id: 23, label: "แช่แข็ง", href: "/products?type=frozen" },
      { id: 24, label: "อบแห้ง", href: "/products?type=dried" },
      { id: 25, label: "สินค้าทั้งหมด", href: "/products" },
    ],
  },
  { id: 3, label: "เยี่ยมชมสวน", href: "/tours", children: [] },
  { id: 4, label: "ตรวจสอบย้อนกลับ", href: "/trace", children: [] },
  { id: 5, label: "ติดต่อเรา", href: "/contact", children: [] },
];

const DEFAULT_TOOLBAR: Toolbar = {
  account: true,
  search: true,
  compare: true,
  wishlist: true,
  cart: true,
};

const socials = [
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.026 2.096 15.665 2 14.647 2 11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
      </svg>
    ),
  },
  {
    href: "https://line.me",
    label: "LINE",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.365 9.863c.349 0 .633.284.633.633 0 .349-.284.633-.633.633h-4.464v.966h2.92c.349 0 .633.284.633.633 0 .349-.284.633-.633.633h-2.92v1.6h4.464c.349 0 .633.284.633.633 0 .349-.284.633-.633.633H12.9a.633.633 0 01-.633-.633V9.863c0-.349.284-.633.633-.633h6.465zM9.2 9.23c0-.35.284-.633.633-.633h.012c.349 0 .633.284.633.633v5.13a.633.633 0 01-1.266 0V9.23zm-2.48.633H4.256a.633.633 0 00-.633.633v4.497c0 .349.284.633.633.633h.012a.633.633 0 00.633-.633v-1.53h1.82c.97 0 1.76-.79 1.76-1.76s-.79-1.84-1.76-1.84zm0 2.413H4.901v-1.18h1.82c.326 0 .59.264.59.59s-.264.59-.59.59z" />
        <path d="M12 2C6.477 2 2 6.025 2 10.994c0 2.503 1.22 4.745 3.127 6.278-.09.74-.54 2.66-.618 3.07-.09.48.177.474.372.345.16-.106 2.54-1.724 3.47-2.37A12.3 12.3 0 0012 19.987c5.523 0 10-4.025 10-8.993C22 6.025 17.523 2 12 2z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.5 6.2a3.05 3.05 0 00-2.15-2.16C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.35.54A3.05 3.05 0 00.5 6.2 31.9 31.9 0 000 12a31.9 31.9 0 00.5 5.8 3.05 3.05 0 002.15 2.16C4.5 20.5 12 20.5 12 20.5s7.5 0 9.35-.54a3.05 3.05 0 002.15-2.16A31.9 31.9 0 0024 12a31.9 31.9 0 00-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    ),
  },
];

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.5 13.5C2.5 11.0147 4.51472 9 7 9H9C11.4853 9 13.5 11.0147 13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden>
      <path d="M0 1H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M0 8H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M0 15H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeaderSearch({
  className = "",
  onSubmitExtra,
}: {
  className?: string;
  onSubmitExtra?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
    onSubmitExtra?.();
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`relative w-full ${className}`}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหาสินค้า..."
        aria-label="ค้นหาสินค้า"
        className="h-11 w-full rounded-full border border-black/10 bg-white py-2.5 pr-12 pl-5 text-sm text-foreground outline-none transition focus:border-primary-light"
      />
      <button
        type="submit"
        aria-label="ค้นหา"
        className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-primary transition hover:bg-primary/5"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

export function SiteHeader() {
  const [lang, setLang] = useState<"th" | "en">("th");
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navOpenId, setNavOpenId] = useState<number | null>(null);
  const [mobileExpandId, setMobileExpandId] = useState<number | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV);
  const [toolbar, setToolbar] = useState<Toolbar>(DEFAULT_TOOLBAR);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Hysteresis: avoid bounce when sticky header height changes
      setScrolled((prev) => {
        if (!prev && y > 72) return true;
        if (prev && y <= 0) return false;
        return prev;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/v1/public/header", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json?.data?.nav) && json.data.nav.length > 0) {
          setNavItems(json.data.nav);
        }
        if (json?.data?.toolbar) {
          setToolbar({
            account: json.data.toolbar.account !== false,
            search: json.data.toolbar.search !== false,
            compare: json.data.toolbar.compare !== false,
            wishlist: json.data.toolbar.wishlist !== false,
            cart: json.data.toolbar.cart !== false,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const mobileMenu =
    portalReady &&
    createPortal(
      <>
        <div
          className={`fixed inset-0 z-[200] bg-black/40 transition-opacity xl:hidden ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={closeMobile}
          aria-hidden={!mobileOpen}
        />
        <aside
          className={`fixed inset-y-0 left-0 z-[210] flex h-dvh max-h-dvh w-[min(100%,320px)] flex-col bg-white shadow-2xl transition-transform duration-300 xl:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
          aria-hidden={!mobileOpen}
          aria-label="เมนูมือถือ"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-5 py-4">
            <SiteBrandLink
              className="font-heading font-bold text-primary"
              imageClassName="h-11 w-auto max-w-[200px] object-contain"
              onNavigate={closeMobile}
            />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-black/5"
              aria-label="ปิดเมนู"
              onClick={closeMobile}
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navItems.map((l) => {
                const hasChildren = (l.children?.length ?? 0) > 0;
                const expanded = mobileExpandId === l.id;
                return (
                  <li key={l.id}>
                    {hasChildren ? (
                      <div>
                        <div className="flex items-center">
                          <Link
                            href={l.href}
                            className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-accent-soft"
                            onClick={closeMobile}
                          >
                            {l.label}
                          </Link>
                          <button
                            type="button"
                            className="mr-1 flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-accent-soft"
                            aria-expanded={expanded}
                            onClick={() =>
                              setMobileExpandId((id) =>
                                id === l.id ? null : l.id,
                              )
                            }
                          >
                            {expanded ? "−" : "+"}
                          </button>
                        </div>
                        {expanded ? (
                          <ul className="mb-1 ml-3 space-y-0.5 border-l border-black/5 pl-2">
                            {l.children.map((c) => (
                              <li key={c.id}>
                                <Link
                                  href={c.href}
                                  className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-accent-soft hover:text-primary"
                                  onClick={closeMobile}
                                >
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : (
                      <Link
                        href={l.href}
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-accent-soft"
                        onClick={closeMobile}
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-black/5 px-4 pt-4">
              <a href="tel:021234567" className="block text-sm text-muted">
                โทร 02-123-4567
              </a>
              {toolbar.account ? (
                <Link
                  href="/admin/login"
                  className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={closeMobile}
                >
                  เข้าสู่ระบบ Admin
                </Link>
              ) : null}
            </div>
          </nav>
        </aside>
      </>,
      document.body,
    );

  return (
    <>
    <header
      className={`sticky top-0 z-[100] bg-surface/95 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      {/* Top bar — collapses only after scroll threshold (hysteresis, no bounce) */}
      <div
        className={`relative z-[60] hidden overflow-hidden border-b border-black/5 bg-primary text-white/90 lg:block ${
          scrolled
            ? "pointer-events-none max-h-0 border-transparent opacity-0"
            : "max-h-12 opacity-100"
        }`}
        style={{ transition: "max-height 200ms ease, opacity 160ms ease" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-0 py-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="inline-flex items-center text-accent transition hover:text-white"
              >
                {s.icon}
              </a>
            ))}
            <a
              href="tel:021234567"
              className="inline-flex items-center gap-2 text-white/90 transition hover:text-accent"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6.6 10.8c1.4 2.7 3.9 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              02-123-4567
            </a>
          </div>

          <div className="relative">
            <button
              type="button"
              id="tp-header-lang-toggle"
              onClick={() => setLangOpen((v) => !v)}
              className="inline-flex items-center gap-2 text-sm text-white/90 transition hover:text-accent"
              aria-expanded={langOpen}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="flag h-3.5 w-5 rounded-[2px] object-cover"
                src={lang === "th" ? "/flags/th.svg" : "/flags/en.svg"}
                alt=""
                width={20}
                height={14}
              />
              <span>{lang === "th" ? "ไทย" : "EN"}</span>
            </button>
            {langOpen ? (
              <ul className="absolute right-0 z-[70] mt-2 min-w-[120px] overflow-hidden rounded-xl border border-black/5 bg-white py-1 text-sm text-primary shadow-lg">
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-accent-soft"
                    onClick={() => {
                      setLang("th");
                      setLangOpen(false);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="flag h-3.5 w-5 rounded-[2px] object-cover"
                      src="/flags/th.svg"
                      alt=""
                      width={20}
                      height={14}
                    />
                    <span>ไทย</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-accent-soft"
                    onClick={() => {
                      setLang("en");
                      setLangOpen(false);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="flag h-3.5 w-5 rounded-[2px] object-cover"
                      src="/flags/en.svg"
                      alt=""
                      width={20}
                      height={14}
                    />
                    <span>EN</span>
                  </button>
                </li>
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main bar — fixed padding (height must not toggle with scroll) */}
      <div className="border-b border-black/5">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-0 py-3 xl:grid-cols-[auto_1fr_minmax(220px,1fr)_auto] xl:gap-6">
          <SiteBrandLink />

          <nav className="hidden xl:block" aria-label="เมนูหลัก">
            <ul className="flex items-center gap-6">
              {navItems.map((l) => {
                const hasChildren = (l.children?.length ?? 0) > 0;
                return (
                  <li
                    key={l.id}
                    className="relative"
                    onMouseEnter={() => hasChildren && setNavOpenId(l.id)}
                    onMouseLeave={() => setNavOpenId(null)}
                  >
                    {hasChildren ? (
                      <>
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={l.href}
                            className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                          >
                            {l.label}
                          </Link>
                          <button
                            type="button"
                            className="text-foreground/60 transition hover:text-primary"
                            aria-label={`${l.label} submenu`}
                            aria-expanded={navOpenId === l.id}
                            onClick={() =>
                              setNavOpenId((id) => (id === l.id ? null : l.id))
                            }
                          >
                            <svg
                              width="10"
                              height="6"
                              viewBox="0 0 10 6"
                              fill="none"
                              aria-hidden
                              className={`transition ${navOpenId === l.id ? "rotate-180" : ""}`}
                            >
                              <path
                                d="M1 1l4 4 4-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                        {navOpenId === l.id ? (
                          <ul className="absolute top-full left-0 z-50 min-w-[200px] pt-2">
                            <li className="overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-lg">
                              <ul>
                                {l.children.map((c) => (
                                  <li key={c.id}>
                                    <Link
                                      href={c.href}
                                      className="block px-4 py-2.5 text-sm text-primary hover:bg-accent-soft"
                                      onClick={() => setNavOpenId(null)}
                                    >
                                      {c.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          </ul>
                        ) : null}
                      </>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm font-medium text-foreground/80 transition hover:text-primary"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            {toolbar.account ? (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-primary transition hover:bg-primary/5"
                  aria-expanded={accountOpen}
                >
                  <UserIcon />
                  <span className="hidden flex-col items-start leading-tight xl:flex">
                    <span className="text-xs text-muted">ยินดีต้อนรับ</span>
                    <span className="font-semibold">บัญชีสมาชิก</span>
                  </span>
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 z-20 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-lg">
                    <Link
                      href="/admin/login"
                      className="block px-4 py-2 text-sm text-primary hover:bg-accent-soft"
                      onClick={() => setAccountOpen(false)}
                    >
                      เข้าสู่ระบบ Admin
                    </Link>
                    <Link
                      href="/contact"
                      className="block px-4 py-2 text-sm text-primary hover:bg-accent-soft"
                      onClick={() => setAccountOpen(false)}
                    >
                      ติดต่อเรา
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}

            {toolbar.search ? (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5 xl:hidden"
                aria-label="ค้นหาสินค้า"
                aria-expanded={mobileSearchOpen}
                onClick={() => setMobileSearchOpen((v) => !v)}
              >
                <SearchIcon size={20} />
              </button>
            ) : null}

            {toolbar.compare ? <CompareLink /> : null}
            {toolbar.wishlist ? <WishlistLink /> : null}
            {toolbar.cart ? <CartLink /> : null}

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5 xl:hidden"
              aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {toolbar.search && mobileSearchOpen ? (
          <div className="border-t border-black/5 px-5 py-3 xl:hidden md:px-8">
            <HeaderSearch onSubmitExtra={() => setMobileSearchOpen(false)} />
          </div>
        ) : null}
      </div>
    </header>
    {mobileMenu}
    </>
  );
}
