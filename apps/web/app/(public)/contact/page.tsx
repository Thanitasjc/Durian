import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "ติดต่อเรา | AuraGold Durian",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-bold text-primary">ติดต่อเรา</h1>
      <p className="mt-3 text-muted">
        สอบถามสินค้า ราคาส่ง หรือจองทัวร์เยี่ยมชมสวน
      </p>
      <div className="mt-10 rounded-3xl border border-black/5 bg-surface p-6 shadow-sm md:p-8">
        <Suspense fallback={<p className="text-sm text-muted">กำลังโหลดฟอร์ม...</p>}>
          <ContactForm />
        </Suspense>
      </div>
    </main>
  );
}
