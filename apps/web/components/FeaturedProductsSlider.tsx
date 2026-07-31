import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/api";

type Props = {
  products: Product[];
};

/** สินค้าแนะนำ — แสดงสูงสุด 5 ชิ้นแบบกริด ไม่สไลด์ */
export function FeaturedProductsSlider({ products }: Props) {
  const list = products.slice(0, 5);

  if (!list.length) {
    return (
      <p className="mt-12 text-center text-muted">
        ยังไม่มีสินค้า — เพิ่มได้ที่ Admin → สินค้า (เปิด “แสดงในสินค้าแนะนำ”)
      </p>
    );
  }

  return (
    <ul className="mt-12 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {list.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
