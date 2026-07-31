<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    /**
     * Inventory qty to deduct for N sellable units (ลูก/ชิ้น).
     * If warehouse unit is kg and product has weight_kg → qty * weight.
     */
    public function inventoryQtyForOrder(Product $product, float $sellQty): float
    {
        $inventory = $product->inventoryItem;
        if (! $inventory) {
            return $sellQty;
        }

        $unit = strtolower((string) $inventory->unit);
        if (in_array($unit, ['kg', 'กก.', 'กก'], true) && $product->weight_kg) {
            return round($sellQty * (float) $product->weight_kg, 2);
        }

        return $sellQty;
    }

    /** Available sellable units (ลูก) from linked inventory or stock_qty. */
    public function availableUnits(Product $product): int
    {
        $product->loadMissing('inventoryItem');

        if ($product->inventoryItem) {
            $invQty = (float) $product->inventoryItem->quantity;
            $unit = strtolower((string) $product->inventoryItem->unit);
            if (in_array($unit, ['kg', 'กก.', 'กก'], true) && $product->weight_kg && $product->weight_kg > 0) {
                return (int) floor($invQty / (float) $product->weight_kg);
            }

            return (int) max(0, floor($invQty));
        }

        return (int) max(0, $product->stock_qty ?? 0);
    }

    public function syncProductStockFromInventory(Product $product): void
    {
        $product->loadMissing('inventoryItem');
        if (! $product->inventoryItem) {
            return;
        }

        $product->update([
            'stock_qty' => $this->availableUnits($product),
        ]);
    }

    public function syncProductsForInventoryItem(InventoryItem $item): void
    {
        Product::query()
            ->where('inventory_item_id', $item->id)
            ->get()
            ->each(fn (Product $p) => $this->syncProductStockFromInventory($p));
    }

    /**
     * Deduct warehouse stock for an order line. Sets stock_deducted on order.
     */
    public function deductForOrder(Order $order, ?string $actor = null): Order
    {
        if ($order->stock_deducted) {
            return $order;
        }

        $product = $order->product_id
            ? Product::query()->with('inventoryItem')->find($order->product_id)
            : null;

        if (! $product?->inventory_item_id) {
            // Catalog-only stock
            if ($product && $product->stock_qty !== null) {
                $sellQty = (float) $order->quantity;
                if ($this->availableUnits($product) < $sellQty) {
                    throw ValidationException::withMessages([
                        'quantity' => "สต็อกไม่พอสำหรับ {$product->name} (เหลือ {$this->availableUnits($product)})",
                    ]);
                }
                $product->update([
                    'stock_qty' => max(0, (int) $product->stock_qty - (int) ceil($sellQty)),
                ]);
                $order->update([
                    'stock_deducted' => true,
                    'stock_qty_deducted' => $sellQty,
                ]);
            }

            return $order->fresh();
        }

        return DB::transaction(function () use ($order, $product, $actor) {
            $inventory = InventoryItem::query()
                ->whereKey($product->inventory_item_id)
                ->lockForUpdate()
                ->firstOrFail();

            $sellQty = (float) $order->quantity;
            $deductQty = $this->inventoryQtyForOrder($product->setRelation('inventoryItem', $inventory), $sellQty);

            if ((float) $inventory->quantity + 0.0001 < $deductQty) {
                throw ValidationException::withMessages([
                    'quantity' => "คลังไม่พอสำหรับ {$product->name} (เหลือ {$inventory->quantity} {$inventory->unit})",
                ]);
            }

            $inventory->quantity = round((float) $inventory->quantity - $deductQty, 2);
            $inventory->save();

            StockMovement::query()->create([
                'inventory_item_id' => $inventory->id,
                'movement_type' => 'out',
                'quantity' => $deductQty,
                'reference' => $order->order_number,
                'note' => "ตัดสต็อกออเดอร์ {$order->order_number} · {$product->name} x{$sellQty}",
                'created_by' => $actor ?? 'system',
            ]);

            $order->update([
                'inventory_item_id' => $inventory->id,
                'stock_deducted' => true,
                'stock_qty_deducted' => $deductQty,
            ]);

            $this->syncProductStockFromInventory($product->fresh('inventoryItem'));

            return $order->fresh();
        });
    }

    public function restoreForOrder(Order $order, ?string $actor = null): Order
    {
        if (! $order->stock_deducted) {
            return $order;
        }

        $product = $order->product_id
            ? Product::query()->with('inventoryItem')->find($order->product_id)
            : null;

        $restoreQty = (float) ($order->stock_qty_deducted ?? $order->quantity);

        if (! $product?->inventory_item_id) {
            if ($product && $product->stock_qty !== null) {
                $product->update([
                    'stock_qty' => (int) $product->stock_qty + (int) ceil((float) $order->quantity),
                ]);
            }
            $order->update([
                'stock_deducted' => false,
                'stock_qty_deducted' => null,
            ]);

            return $order->fresh();
        }

        return DB::transaction(function () use ($order, $product, $restoreQty, $actor) {
            $inventory = InventoryItem::query()
                ->whereKey($product->inventory_item_id)
                ->lockForUpdate()
                ->firstOrFail();

            $inventory->quantity = round((float) $inventory->quantity + $restoreQty, 2);
            $inventory->save();

            StockMovement::query()->create([
                'inventory_item_id' => $inventory->id,
                'movement_type' => 'in',
                'quantity' => $restoreQty,
                'reference' => $order->order_number,
                'note' => "คืนสต็อกจากยกเลิกออเดอร์ {$order->order_number}",
                'created_by' => $actor ?? 'system',
            ]);

            $order->update([
                'stock_deducted' => false,
                'stock_qty_deducted' => null,
            ]);

            $this->syncProductStockFromInventory($product->fresh('inventoryItem'));

            return $order->fresh();
        });
    }
}
