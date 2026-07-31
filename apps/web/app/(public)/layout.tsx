import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BrandingProvider } from "@/components/SiteBrand";
import { CartMini } from "@/components/CartLink";
import { CompareBar } from "@/components/CompareBar";
import { ScrollTop } from "@/components/ScrollTop";
import { fetchBranding } from "@/lib/api";
import { CartProvider } from "@/lib/cart";
import { CompareProvider } from "@/lib/compare";
import { WishlistProvider } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await fetchBranding();

  return (
    <BrandingProvider initial={branding}>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CartMini />
            <CompareBar />
            <ScrollTop />
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </BrandingProvider>
  );
}
