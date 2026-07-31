<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\SiteSection;
use App\Services\StockService;
use App\Support\MediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class HomeController extends Controller
{
    public function __construct(private StockService $stock) {}

    public function __invoke(): JsonResponse
    {
        $sections = SiteSection::query()
            ->active()
            ->orderBy('sort_order')
            ->get()
            ->keyBy('key');

        $featuredProducts = Product::query()
            ->published()
            ->featured()
            ->with('inventoryItem')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(12)
            ->get();

        $hotProducts = Product::query()
            ->published()
            ->hot()
            ->with('inventoryItem')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->limit(10)
            ->get();

        $heroSlides = HeroSlide::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function (HeroSlide $slide) {
                $data = $slide->toArray();
                $data['image_url'] = MediaUrl::absolute($slide->image_url);
                if (array_key_exists('video_url', $data)) {
                    $data['video_url'] = MediaUrl::absolute($slide->video_url);
                }

                return $data;
            });

        return response()->json([
            'data' => [
                'sections' => $sections->map(function (SiteSection $section) {
                    $data = $section->toArray();
                    $data['image_url'] = MediaUrl::absolute($section->image_url);

                    return $data;
                }),
                'featured_products' => $this->withStock($featuredProducts),
                'hot_products' => $this->withStock($hotProducts),
                'hero_slides' => $heroSlides,
            ],
        ]);
    }

    private function withStock(Collection $products): array
    {
        return $products->map(function (Product $product) {
            $data = $product->toArray();
            $data['image_url'] = MediaUrl::absolute($product->image_url);
            if (is_array($product->gallery_images)) {
                $data['gallery_images'] = array_map(
                    fn ($u) => is_string($u) ? MediaUrl::absolute($u) : $u,
                    $product->gallery_images,
                );
            }
            $data['stock_qty'] = $this->stock->availableUnits($product);

            return $data;
        })->values()->all();
    }
}
