<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function __construct(private StockService $stock) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => Product::query()->with('inventoryItem')->orderBy('sort_order')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $product = Product::query()->create([
            ...$data,
            'slug' => $data['slug'] ?? Str::slug($data['name']).'-'.Str::random(4),
            'unit' => $data['unit'] ?? 'kg',
            'is_published' => $data['is_published'] ?? true,
            'is_featured' => $data['is_featured'] ?? false,
            'is_hot' => $data['is_hot'] ?? false,
        ]);

        if (! empty($product->inventory_item_id)) {
            $this->stock->syncProductStockFromInventory($product->fresh('inventoryItem'));
        }

        return response()->json(['data' => $product->fresh('inventoryItem')], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => $product->load('inventoryItem')]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $product->update($this->validated($request, $product->id));
        $product = $product->fresh('inventoryItem');

        if ($product->inventory_item_id) {
            $this->stock->syncProductStockFromInventory($product);
        }

        return response()->json(['data' => $product->fresh('inventoryItem')]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'ลบสินค้าแล้ว']);
    }

    private function validated(Request $request, ?int $id = null): array
    {
        $slugRule = $id
            ? ['sometimes', 'string', 'max:180', 'unique:products,slug,'.$id]
            : ['nullable', 'string', 'max:180', 'unique:products,slug'];

        $data = $request->validate([
            'slug' => $slugRule,
            'name' => [$id ? 'sometimes' : 'required', 'string', 'max:180'],
            'name_en' => ['nullable', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'seller_name' => ['nullable', 'string', 'max:180'],
            'seller_phone' => ['nullable', 'string', 'max:40'],
            'product_type' => [$id ? 'sometimes' : 'required', 'in:fresh,flesh,frozen,dried'],
            'badge' => ['nullable', 'string', 'max:50'],
            'price' => ['nullable', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:20'],
            'stock_qty' => ['nullable', 'integer', 'min:0'],
            'inventory_item_id' => ['nullable', 'integer', 'exists:inventory_items,id'],
            'weight_kg' => ['nullable', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'gallery_images' => ['nullable'],
            'rating' => ['nullable', 'numeric'],
            'review_count' => ['nullable', 'integer'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_hot' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        if (array_key_exists('gallery_images', $data)) {
            $gallery = $data['gallery_images'];
            if (is_string($gallery)) {
                $decoded = json_decode($gallery, true);
                $gallery = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
            }
            if (! is_array($gallery)) {
                $gallery = [];
            }
            $data['gallery_images'] = array_values(array_filter($gallery, fn ($u) => is_string($u) && $u !== ''));
        }

        foreach (['is_published', 'is_featured', 'is_hot'] as $boolKey) {
            if (array_key_exists($boolKey, $data)) {
                $data[$boolKey] = filter_var(
                    $data[$boolKey],
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ) ?? (bool) $data[$boolKey];
            }
        }

        if (array_key_exists('inventory_item_id', $data) && blank($data['inventory_item_id'])) {
            $data['inventory_item_id'] = null;
        }

        return $data;
    }
}
