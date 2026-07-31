<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\NumberingService;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function __construct(
        private NumberingService $numbering,
        private StockService $stock,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:180'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'customer_address' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'numeric', 'min:1'],
        ]);

        try {
            $orders = DB::transaction(function () use ($data) {
                $created = [];

                foreach ($data['items'] as $line) {
                    $product = Product::query()
                        ->published()
                        ->with('inventoryItem')
                        ->findOrFail($line['product_id']);

                    $qty = (float) $line['qty'];
                    $available = $this->stock->availableUnits($product);
                    if ($available < $qty) {
                        throw ValidationException::withMessages([
                            'items' => "สต็อกไม่พอ: {$product->name} (เหลือ {$available})",
                        ]);
                    }

                    $unitPrice = $product->price;
                    if ($product->weight_kg && $product->price != null) {
                        $unitPrice = (int) round($product->price * (float) $product->weight_kg);
                    }

                    $order = Order::query()->create([
                        'order_number' => $this->numbering->nextOrderNumber(),
                        'customer_name' => $data['customer_name'],
                        'product_id' => $product->id,
                        'inventory_item_id' => $product->inventory_item_id,
                        'product_name' => $product->name,
                        'product_type' => $product->product_type,
                        'quantity' => $qty,
                        'unit' => $product->weight_kg ? 'ลูก' : $product->unit,
                        'total_amount' => (int) (($unitPrice ?? 0) * $qty),
                        'status' => 'รอชำระเงิน',
                        'order_date' => now()->toDateString(),
                        'notes' => trim(implode("\n", array_filter([
                            'โทร: '.$data['customer_phone'],
                            ! empty($data['customer_address']) ? 'ที่อยู่: '.$data['customer_address'] : null,
                            $data['notes'] ?? null,
                        ]))),
                        'stock_deducted' => false,
                    ]);

                    $this->stock->deductForOrder($order, 'web-checkout');
                    $created[] = $order->fresh();
                }

                return $created;
            });
        } catch (ValidationException $e) {
            throw $e;
        }

        return response()->json([
            'data' => [
                'orders' => $orders,
                'order_numbers' => collect($orders)->pluck('order_number')->values(),
                'message' => 'รับคำสั่งซื้อแล้ว และตัดสต็อกคลังเรียบร้อย',
            ],
        ], 201);
    }
}
