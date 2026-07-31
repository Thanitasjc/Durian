<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryItemController extends Controller
{
    public function __construct(private StockService $stock) {}

    public function index(Request $request): JsonResponse
    {
        $query = InventoryItem::query()->latest();
        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }
        if ($request->filled('storage_zone')) {
            $query->where('storage_zone', $request->string('storage_zone'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'category' => ['required', 'in:raw,finished,packaging'],
            'product_type' => ['nullable', 'string', 'max:50'],
            'lot_number' => ['nullable', 'string', 'max:50'],
            'batch_number' => ['nullable', 'string', 'max:50'],
            'quantity' => ['required', 'numeric'],
            'unit' => ['nullable', 'string', 'max:20'],
            'storage_zone' => ['nullable', 'in:fresh,chilled,frozen,dry'],
            'location' => ['nullable', 'string', 'max:120'],
            'production_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'rotation_method' => ['nullable', 'in:FIFO,FEFO'],
        ]);

        $item = InventoryItem::query()->create($data);

        StockMovement::query()->create([
            'inventory_item_id' => $item->id,
            'movement_type' => 'in',
            'quantity' => $item->quantity,
            'reference' => 'opening',
            'created_by' => $request->user()?->name,
        ]);

        return response()->json(['data' => $item], 201);
    }

    public function show(InventoryItem $inventoryItem): JsonResponse
    {
        return response()->json(['data' => $inventoryItem->load('movements')]);
    }

    public function update(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:180'],
            'category' => ['sometimes', 'in:raw,finished,packaging'],
            'product_type' => ['nullable', 'string', 'max:50'],
            'lot_number' => ['nullable', 'string', 'max:50'],
            'batch_number' => ['nullable', 'string', 'max:50'],
            'quantity' => ['sometimes', 'numeric'],
            'unit' => ['nullable', 'string', 'max:20'],
            'storage_zone' => ['nullable', 'in:fresh,chilled,frozen,dry'],
            'location' => ['nullable', 'string', 'max:120'],
            'production_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
            'rotation_method' => ['nullable', 'in:FIFO,FEFO'],
        ]);

        $oldQty = (float) $inventoryItem->quantity;
        $inventoryItem->update($data);

        if (isset($data['quantity']) && (float) $data['quantity'] !== $oldQty) {
            StockMovement::query()->create([
                'inventory_item_id' => $inventoryItem->id,
                'movement_type' => 'adjust',
                'quantity' => (float) $data['quantity'] - $oldQty,
                'reference' => 'adjust',
                'created_by' => $request->user()?->name,
            ]);
            $this->stock->syncProductsForInventoryItem($inventoryItem->fresh());
        }

        return response()->json(['data' => $inventoryItem->fresh()]);
    }

    public function destroy(InventoryItem $inventoryItem): JsonResponse
    {
        $inventoryItem->delete();

        return response()->json(['message' => 'ลบรายการสต็อกแล้ว']);
    }

    public function move(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $data = $request->validate([
            'movement_type' => ['required', 'in:in,out,adjust,transfer'],
            'quantity' => ['required', 'numeric'],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string'],
            'storage_zone' => ['nullable', 'in:fresh,chilled,frozen,dry'],
            'location' => ['nullable', 'string', 'max:120'],
        ]);

        $item = DB::transaction(function () use ($inventoryItem, $data, $request) {
            $qty = (float) $data['quantity'];
            if (in_array($data['movement_type'], ['out'], true)) {
                $inventoryItem->quantity = max(0, (float) $inventoryItem->quantity - abs($qty));
            } elseif ($data['movement_type'] === 'in') {
                $inventoryItem->quantity = (float) $inventoryItem->quantity + abs($qty);
            } else {
                $inventoryItem->quantity = (float) $inventoryItem->quantity + $qty;
            }
            if (! empty($data['storage_zone'])) {
                $inventoryItem->storage_zone = $data['storage_zone'];
            }
            if (array_key_exists('location', $data)) {
                $inventoryItem->location = $data['location'];
            }
            $inventoryItem->save();

            StockMovement::query()->create([
                'inventory_item_id' => $inventoryItem->id,
                'movement_type' => $data['movement_type'],
                'quantity' => $qty,
                'reference' => $data['reference'] ?? null,
                'note' => $data['note'] ?? null,
                'created_by' => $request->user()?->name,
            ]);

            return $inventoryItem;
        });

        $this->stock->syncProductsForInventoryItem($item->fresh());

        return response()->json(['data' => $item->load('movements')]);
    }
}
