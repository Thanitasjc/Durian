"use client";

import { useEffect, useState } from "react";
import { useCompare } from "@/lib/compare";

export function ScrollTop() {
  const [visible, setVisible] = useState(false);
  const { count } = useCompare();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="กลับขึ้นด้านบน"
      title="กลับขึ้นด้านบน"
      className={`fixed right-5 z-[105] flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg text-white shadow-lg transition hover:bg-primary-light ${
        count > 0 ? "bottom-24" : "bottom-6"
      } ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      ↑
    </button>
  );
}
