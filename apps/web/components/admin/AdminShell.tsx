"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_MENUS } from "@/lib/admin-menus";
import { adminFetch, clearAdminToken, getAdminToken } from "@/lib/admin-api";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    adminFetch<{ data: { name: string } }>("/me")
      .then((res) => {
        setUserName(res.data.name);
        setReady(true);
      })
      .catch(() => {
        clearAdminToken();
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        กำลังโหลดระบบหลังบ้าน...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-100 px-5 py-5">
          <p className="font-heading text-lg font-bold text-primary">AuraGold</p>
          <p className="text-xs text-slate-500">ระบบหลังบ้าน · Admin</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ADMIN_MENUS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-800">{userName}</p>
          <button
            type="button"
            className="mt-2 text-primary hover:underline"
            onClick={() => {
              adminFetch("/logout", { method: "POST" }).catch(() => undefined);
              clearAdminToken();
              router.replace("/admin/login");
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <p className="font-heading text-sm font-bold text-slate-800 md:hidden">
            AuraGold Admin
          </p>
          <p className="hidden text-sm text-slate-500 md:block">
            ฤดูกาล 2026 · ระบบจัดการสวนและแปรรูป
          </p>
          <Link href="/" className="text-xs text-primary hover:underline">
            เปิดเว็บลูกค้า
          </Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
