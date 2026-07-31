import Link from "next/link";
import { FeaturedProductsSlider } from "@/components/FeaturedProductsSlider";
import { HeroBanner } from "@/components/HeroBanner";
import { HotProductsSection } from "@/components/HotProductsSection";
import { MediaImage } from "@/components/MediaImage";
import { fetchHome, type SiteSection } from "@/lib/api";

export const dynamic = "force-dynamic";

function sectionOf(
  sections: Record<string, SiteSection>,
  key: string,
): SiteSection | null {
  return sections[key] ?? null;
}

export default async function HomePage() {
  const home = await fetchHome();
  const hero = sectionOf(home.sections, "hero");
  const story = sectionOf(home.sections, "story");
  const sustainability = sectionOf(home.sections, "sustainability");
  const productsSec = sectionOf(home.sections, "products");
  const hotProductsSec = sectionOf(home.sections, "hot_products");
  const tours = sectionOf(home.sections, "tours");
  const trace = sectionOf(home.sections, "trace");
  const featured = home.featured_products;
  const hotProducts = home.hot_products?.length
    ? home.hot_products
    : home.featured_products;

  const storyStats =
    (story?.meta?.stats as Array<{ value: string; label: string }> | undefined) ??
    [];
  const sustainCards =
    (sustainability?.meta?.cards as Array<{ title: string; desc: string }> | undefined) ??
    [];
  const tourBullets =
    (tours?.meta?.bullets as string[] | undefined) ?? [];

  return (
    <main>
      {/* HERO slideshow — CRUD key: hero (meta.slides optional) */}
      <HeroBanner slides={home.hero_slides} hero={hero} />

      {/* STORY — CRUD key: story */}
      {story ? (
        <section id="story" className="bg-surface py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
            <div className="organic-shape relative aspect-[4/5] overflow-hidden shadow-xl">
              {story.image_url ? (
                <MediaImage
                  src={story.image_url}
                  alt={story.title || "เรื่องราว"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : null}
            </div>
            <div>
              {story.eyebrow ? (
                <p className="text-xs font-semibold tracking-widest text-primary-light">
                  {story.eyebrow}
                </p>
              ) : null}
              <h2 className="font-heading mt-2 text-3xl font-bold text-primary">
                {story.title}
              </h2>
              {story.body ? (
                <p className="mt-6 text-muted leading-relaxed">{story.body}</p>
              ) : null}
              {storyStats.length > 0 ? (
                <ul className="mt-8 grid grid-cols-2 gap-6 text-center">
                  {storyStats.map((s) => (
                    <li key={s.label} className="rounded-2xl bg-accent-soft p-4">
                      <p className="font-heading text-2xl font-bold text-primary">
                        {s.value}
                      </p>
                      <p className="text-xs text-muted">{s.label}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* SUSTAINABILITY — CRUD key: sustainability */}
      {sustainability ? (
        <section id="sustainability" className="bg-primary py-20 text-white md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <h2 className="font-heading text-3xl font-bold">{sustainability.title}</h2>
            {sustainability.body ? (
              <p className="mt-4 max-w-2xl text-white/80">{sustainability.body}</p>
            ) : null}
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {sustainCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8"
                >
                  <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* HOT PRODUCTS — Ogenix-style + CRUD key: hot_products */}
      {(hotProductsSec?.is_active !== false) && hotProducts.length > 0 ? (
        <HotProductsSection
          eyebrow={hotProductsSec?.eyebrow}
          title={hotProductsSec?.title}
          products={hotProducts}
        />
      ) : null}

      {/* PRODUCTS — CRUD key: products + Product CRUD */}
      <section id="products" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-primary-light">
                {productsSec?.eyebrow || "คอลเลกชัน"}
              </p>
              <h2 className="font-heading mt-2 text-3xl font-bold text-primary">
                {productsSec?.title || "สินค้าแนะนำ"}
              </h2>
              {productsSec?.body ? (
                <p className="mt-2 text-sm text-muted">{productsSec.body}</p>
              ) : null}
            </div>
            <Link
              href={productsSec?.cta_link || "/products"}
              className="text-sm font-semibold text-primary-light"
            >
              {productsSec?.cta_label || "ดูทั้งหมด"} →
            </Link>
          </div>
          <FeaturedProductsSlider products={featured} />
        </div>
      </section>

      {/* TOURS — CRUD key: tours */}
      {tours ? (
        <section id="tours" className="bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
            {tours.eyebrow ? (
              <p className="text-xs font-semibold tracking-widest text-primary-light">
                {tours.eyebrow}
              </p>
            ) : null}
            <h2 className="font-heading mt-2 text-3xl font-bold text-primary">
              {tours.title}
            </h2>
            {tours.body ? (
              <p className="mt-4 leading-relaxed text-muted">{tours.body}</p>
            ) : null}
            {tourBullets.length > 0 ? (
              <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm text-muted">
                {tourBullets.map((b) => (
                  <li key={b}>✓ {b}</li>
                ))}
              </ul>
            ) : null}
            {tours.cta_label && tours.cta_link ? (
              <Link
                href={tours.cta_link}
                className="mt-10 inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-light"
              >
                {tours.cta_label}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* TRACE — CRUD key: trace */}
      {trace ? (
        <section id="trace" className="border-t border-black/5 py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center md:px-8">
            <div>
              {trace.eyebrow ? (
                <p className="text-xs font-semibold text-primary-light">{trace.eyebrow}</p>
              ) : null}
              <h2 className="font-heading mt-1 text-2xl font-bold text-primary">
                {trace.title}
              </h2>
              {trace.body ? (
                <p className="mt-2 max-w-xl text-sm text-muted">{trace.body}</p>
              ) : null}
            </div>
            {trace.cta_label && trace.cta_link ? (
              <Link
                href={trace.cta_link}
                className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-primary"
              >
                {trace.cta_label}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
