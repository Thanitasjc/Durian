"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist";

function HeartIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 22 20" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.239 18.8538C13.4096 17.5179 15.4289 15.9456 17.2607 14.1652C18.5486 12.8829 19.529 11.3198 20.1269 9.59539C21.2029 6.25031 19.9461 2.42083 16.4289 1.28752C14.5804 0.692435 12.5616 1.03255 11.0039 2.20148C9.44567 1.03398 7.42754 0.693978 5.57894 1.28752C2.06175 2.42083 0.795919 6.25031 1.87187 9.59539C2.46978 11.3198 3.45021 12.8829 4.73806 14.1652C6.56988 15.9456 8.58917 17.5179 10.7598 18.8538L10.9949 19L11.239 18.8538Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WishlistLink() {
  const { count } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="relative flex h-10 w-10 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5"
      aria-label={
        count > 0 ? `รายการถูกใจ ${count} รายการ` : "รายการถูกใจ"
      }
      title="ถูกใจ"
    >
      <HeartIcon />
      {count > 0 ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
