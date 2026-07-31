"use client";

import Link from "next/link";
import { useCompare } from "@/lib/compare";

function CompareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 7h11M5 7h.01M8 12h11M5 12h.01M8 17h11M5 17h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 4l3 3-3 3M8 14l-3 3 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompareLink() {
  const { count } = useCompare();

  return (
    <Link
      href="/compare"
      className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5 md:flex"
      aria-label={
        count > 0 ? `เปรียบเทียบ ${count} รายการ` : "เปรียบเทียบสินค้า"
      }
      title="เปรียบเทียบ"
    >
      <CompareIcon />
      {count > 0 ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
