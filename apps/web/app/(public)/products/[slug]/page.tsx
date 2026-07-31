import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailsTabs } from "@/components/ProductDetailsTabs";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { fetchProduct } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "ไม่พบสินค้า" };
  return { title: `${product.name} | AuraGold Durian` };
}

function buildGallery(product: {
  image_url: string | null;
  gallery_images?: string[] | null;
}): string[] {
  const list = [
    ...(product.image_url ? [product.image_url] : []),
    ...((product.gallery_images ?? []).filter(Boolean) as string[]),
  ];
  return Array.from(new Set(list));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const gallery = buildGallery(product);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Link
        href="/products"
        className="text-sm text-primary-light hover:underline"
      >
        ← กลับรายการสินค้า
      </Link>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={gallery} alt={product.name} />

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <ProductPurchasePanel product={product} />
        </div>
      </div>

      <div id="product-details">
        <ProductDetailsTabs product={product} />
      </div>
    </main>
  );
}
