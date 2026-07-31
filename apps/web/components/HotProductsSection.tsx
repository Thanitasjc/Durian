import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { CompareButton } from "@/components/CompareButton";
import { MediaImage } from "@/components/MediaImage";
import { WishlistButton } from "@/components/WishlistButton";
import { formatPrice, type Product } from "@/lib/api";

type Props = {
  eyebrow?: string | null;
  title?: string | null;
  products: Product[];
};

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating || 5);
  return (
    <div className="flex items-center gap-0.5 text-accent" aria-label={`${rating} ดาว`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? "opacity-100" : "opacity-30"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function HotProductsSection({ eyebrow, title, products }: Props) {
  if (!products.length) return null;

  return (
    <section id="hot-products" className="hot-products bg-[#f6f3ee] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-primary-light uppercase">
            {eyebrow || "Checkout New Products"}
          </span>
          <h2 className="font-heading mt-3 text-3xl font-bold leading-snug text-primary md:text-4xl">
            {(title || "Today’s new hottest products\navailable now")
              .split("\n")
              .map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
          </h2>
        </div>

        <ul className="mt-14 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <li
              key={product.id}
              className="hot-products__item group"
              style={{ animationDelay: `${(index + 1) * 80}ms` }}
            >
              <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/5] overflow-hidden bg-accent-soft">
                  {product.image_url ? (
                    <MediaImage
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      ไม่มีรูป
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition group-hover:opacity-100">
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow"
                      aria-label="ดูรายละเอียด"
                      title="ดูรายละเอียด"
                    >
                      👁
                    </Link>
                    <AddToCartButton product={product} />
                    <WishlistButton product={product} />
                    <CompareButton product={product} />
                  </div>

                  {product.badge ? (
                    <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-primary">
                      {product.badge}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2 p-4 text-center">
                  <Stars rating={product.rating} />
                  <h3 className="font-heading text-base font-semibold text-primary">
                    <Link
                      href={`/products/${product.slug}`}
                      className="hover:text-primary-light"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-sm font-bold text-primary-light">
                    {formatPrice(product.price, product.unit)}
                  </p>
                  <Link
                    href={`/contact?product=${encodeURIComponent(product.slug)}`}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white transition hover:bg-primary-light"
                  >
                    สอบถาม / สั่งซื้อ
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
