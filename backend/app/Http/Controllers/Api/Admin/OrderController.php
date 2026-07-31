<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\NumberingService;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private NumberingService $numbering,
        private StockService $stock,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Order::query()->with(['customer', 'product', 'inventoryItem'])->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'customer_name' => ['nullable', 'string', 'max:180'],
            'product_id' => ['nullable', 'exists:products,id'],
            'product_name' => ['required', 'string', 'max:180'],
            'product_type' => ['nullable', 'string', 'max:50'],
            'quantity' => ['required', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:20'],
            'total_amount' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'delivery_status' => ['nullable', 'string', 'max:50'],
            'order_date' => ['nullable', 'date'],
            'delivery_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'deduct_stock' => ['nullable', 'boolean'],
        ]);

        if (! empty($data['customer_id']) && empty($data['customer_name'])) {
            $data['customer_name'] = Customer::query()->find($data['customer_id'])?->name;
        }

        $product = ! empty($data['product_id'])
            ? Product::query()->find($data['product_id'])
            : null;

        $order = Order::query()->create([
            ...collect($data)->except('deduct_stock')->all(),
            'order_number' => $this->numbering->nextOrderNumber(),
            'order_date' => $data['order_date'] ?? now()->toDateString(),
            'status' => $data['status'] ?? 'รอชำระเงิน',
            'unit' => $data['unit'] ?? 'kg',
            'inventory_item_id' => $product?->inventory_item_id,
            'stock_deducted' => false,
        ]);

        $shouldDeduct = filter_var(
            $data['deduct_stock'] ?? true,
            FILTER_VALIDATE_BOOLEAN
        );

        if ($shouldDeduct && $order->product_id) {
            $order = $this->stock->deductForOrder($order, $request->user()?->name);
        }

        return response()->json(['data' => $order->load(['customer', 'product', 'inventoryItem'])], 201);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json(['data' => $order->load(['customer', 'product', 'inventoryItem'])]);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'customer_name' => ['nullable', 'string', 'max:180'],
            'product_id' => ['nullable', 'exists:products,id'],
            'product_name' => ['sometimes', 'string', 'max:180'],
            'product_type' => ['nullable', 'string', 'max:50'],
            'quantity' => ['sometimes', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:20'],
            'total_amount' => ['sometimes', 'integer', 'min:0'],
            'status' => ['nullable', 'in:รอชำระเงิน,กำลังเตรียมสินค้า,พร้อมจัดส่ง,จัดส่งแล้ว,สำเร็จ,ยกเลิก'],
            'delivery_status' => ['nullable', 'string', 'max:50'],
            'order_date' => ['nullable', 'date'],
            'delivery_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $previousStatus = $order->status;
        $order->update($data);
        $order = $order->fresh();

        if ($order->status === 'ยกเลิก' && $previousStatus !== 'ยกเลิก') {
            $order = $this->stock->restoreForOrder($order, $request->user()?->name);
        } elseif (
            $previousStatus === 'ยกเลิก'
            && $order->status !== 'ยกเลิก'
            && $order->product_id
            && ! $order->stock_deducted
        ) {
            $order = $this->stock->deductForOrder($order, $request->user()?->name);
        }

        return response()->json(['data' => $order->load(['customer', 'product', 'inventoryItem'])]);
    }

    public function destroy(Order $order): JsonResponse
    {
        if ($order->stock_deducted) {
            $this->stock->restoreForOrder($order, request()->user()?->name);
        }
        $order->delete();

        return response()->json(['message' => 'ลบคำสั่งซื้อแล้ว']);
    }
}
