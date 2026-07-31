"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function ContactForm() {
  const searchParams = useSearchParams();
  const product = searchParams.get("product");
  const defaultSubject =
    searchParams.get("subject") ||
    (product ? `สอบถามสินค้า: ${product}` : "");
  const defaultMessage =
    searchParams.get("message") ||
    (product ? `สนใจสินค้า ${product} กรุณาติดต่อกลับ` : "");

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = {
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: String(data.get("phone") || ""),
      subject: String(data.get("subject") || ""),
      message: String(data.get("message")),
    };
    try {
      const res = await fetch("/api/v1/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(json.message ?? "ส่งไม่สำเร็จ");
        return;
      }
      setStatus("ok");
      setMessage(json.message);
      form.reset();
    } catch {
      setStatus("error");
      setMessage("ไม่สามารถเชื่อมต่อ API ได้");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">ชื่อ</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">อีเมล</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">โทรศัพท์</label>
        <input
          name="phone"
          className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">หัวข้อ</label>
        <input
          name="subject"
          defaultValue={defaultSubject}
          className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">ข้อความ</label>
        <textarea
          name="message"
          required
          rows={5}
          defaultValue={defaultMessage}
          className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-60"
      >
        {status === "loading" ? "กำลังส่ง..." : "ส่งข้อความ"}
      </button>
      {status === "ok" || status === "error" ? (
        <p
          className={`text-sm ${status === "ok" ? "text-emerald-700" : "text-red-700"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
