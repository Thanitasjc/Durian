import { TraceSearch } from "@/components/TraceSearch";

export const metadata = {
  title: "ตรวจสอบย้อนกลับ | AuraGold Durian",
};

export default function TracePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        ตรวจสอบย้อนกลับ (Traceability)
      </h1>
      <p className="mt-3 text-muted">
        ค้นหาด้วยรหัส LOT หรือ Batch เพื่อดูเส้นทางจากสวนถึงสินค้า
      </p>
      <div className="mt-10">
        <TraceSearch />
      </div>
    </main>
  );
}
