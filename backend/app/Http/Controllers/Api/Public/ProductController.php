<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(private StockService $stock) {}

    public function index(): JsonResponse
    {
        $products = Product::query()
            ->published()
            ->with('inventoryItem')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Product $p) => $this->withStock($p));

        return response()->json(['data' => $products]);
    }

    public function show(Product $product): JsonResponse
    {
        if (! $product->is_published) {
            abort(404);
        }

        $product->load('inventoryItem');

        return response()->json(['data' => $this->withStock($product)]);
    }

    private function withStock(Product $product): array
    {
        $data = $product->toArray();
        $data['stock_qty'] = $this->stock->availableUnits($product);
        $data['inventory_qty'] = $product->inventoryItem
            ? (float) $product->inventoryItem->quantity
            : null;
        $data['inventory_unit'] = $product->inventoryItem?->unit;

        return $data;
    }
}
