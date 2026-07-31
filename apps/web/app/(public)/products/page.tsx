import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";

export const metadata = {
  title: "สินค้า | AuraGold Durian",
};

const TYPE_LABELS: Record<string, string> = {
  fresh: "ทุเรียนสด",
  flesh: "เนื้อสด",
  frozen: "แช่แข็ง",
  dried: "อบแห้ง",
};

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const term = (q ?? "").trim().toLowerCase();
  const typeFilter = (type ?? "").trim().toLowerCase();
  const all = await fetchProducts();
  let products = all;

  if (typeFilter && TYPE_LABELS[typeFilter]) {
    products = products.filter((p) => p.product_type === typeFilter);
  }

  if (term) {
    products = products.filter((p) => {
      const hay = [
        p.name,
        p.name_en ?? "",
        p.description ?? "",
        p.product_type,
        p.badge ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }

  const typeLabel = TYPE_LABELS[typeFilter];

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 md:px-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        {typeLabel ?? "สินค้าทั้งหมด"}
      </h1>
      <p className="mt-3 text-muted">
        {term
          ? `ผลการค้นหา “${q}” · ${products.length} รายการ`
          : typeLabel
            ? `${products.length} รายการในหมวดนี้`
            : "ทุเรียนสด แช่แข็ง และอบแห้ง จากสวนและโรงแปรรูปของเรา"}
      </p>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-12 text-center text-muted">
          {term || typeLabel
            ? "ไม่พบสินค้าที่ตรงเงื่อนไข"
            : "ไม่พบสินค้า — ตรวจสอบว่า backend รันอยู่ที่พอร์ต 8000"}
        </p>
      ) : null}
    </main>
  );
}
