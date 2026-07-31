<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\SiteSection;
use App\Services\StockService;
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
            ->get();

        return response()->json([
            'data' => [
                'sections' => $sections,
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
            $data['stock_qty'] = $this->stock->availableUnits($product);

            return $data;
        })->values()->all();
    }
}
