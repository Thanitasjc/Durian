import Link from "next/link";

export const metadata = {
  title: "เยี่ยมชมสวน | AuraGold Durian",
};

export default function ToursPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-bold text-primary">เยี่ยมชมสวน</h1>
      <p className="mt-4 leading-relaxed text-muted">
        เดินชมสวน เรียนรู้การปลูกและการแปรรูป ชิมทุเรียนสดจากต้น
        ภายใต้ร่มเงาต้นทุเรียนอายุหลายสิบปี
      </p>
      <ul className="mt-8 space-y-3 text-sm text-muted">
        <li>✓ เดินชมแปลงและระบบรดน้ำ</li>
        <li>✓ ชิมหลายสายพันธุ์</li>
        <li>✓ อาหารกลางวันแนว farm-to-table (ตามรอบ)</li>
      </ul>
      <Link
        href="/contact"
        className="mt-10 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-light"
      >
        จองรอบเยี่ยมชม
      </Link>
    </main>
  );
}
