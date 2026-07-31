<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lot;
use App\Models\Receiving;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceivingController extends Controller
{
    public function __construct(private NumberingService $numbering) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Receiving::query()->with(['lot', 'farm', 'plot'])->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lot_id' => ['nullable', 'exists:lots,id'],
            'farm_id' => ['nullable', 'exists:farms,id'],
            'plot_id' => ['nullable', 'exists:plots,id'],
            'harvest_date' => ['nullable', 'date'],
            'received_at' => ['nullable', 'date'],
            'quantity' => ['nullable', 'integer'],
            'total_weight' => ['required', 'numeric', 'min:0'],
            'receiver' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        if (! empty($data['lot_id'])) {
            $lot = Lot::query()->findOrFail($data['lot_id']);
            $data['farm_id'] ??= $lot->farm_id;
            $data['plot_id'] ??= $lot->plot_id;
            $data['harvest_date'] ??= $lot->harvest_date?->toDateString();
            $data['quantity'] ??= $lot->quantity;
            $lot->update(['status' => 'received']);
        }

        $receiving = Receiving::query()->create([
            ...$data,
            'receiving_number' => $this->numbering->nextReceivingNumber(),
            'received_at' => $data['received_at'] ?? now(),
            'status' => $data['status'] ?? 'รอตรวจรับ',
        ]);

        return response()->json(['data' => $receiving->load(['lot', 'farm', 'plot'])], 201);
    }

    public function show(Receiving $receiving): JsonResponse
    {
        return response()->json(['data' => $receiving->load(['lot', 'farm', 'plot'])]);
    }

    public function update(Request $request, Receiving $receiving): JsonResponse
    {
        $data = $request->validate([
            'lot_id' => ['nullable', 'exists:lots,id'],
            'farm_id' => ['nullable', 'exists:farms,id'],
            'plot_id' => ['nullable', 'exists:plots,id'],
            'harvest_date' => ['nullable', 'date'],
            'received_at' => ['nullable', 'date'],
            'quantity' => ['nullable', 'integer'],
            'total_weight' => ['sometimes', 'numeric', 'min:0'],
            'receiver' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'in:รอตรวจรับ,รับเข้าแล้ว,กักกัน,ไม่ผ่าน'],
            'notes' => ['nullable', 'string'],
        ]);
        $receiving->update($data);

        return response()->json(['data' => $receiving->fresh(['lot', 'farm', 'plot'])]);
    }

    public function destroy(Receiving $receiving): JsonResponse
    {
        $receiving->delete();

        return response()->json(['message' => 'ลบใบรับเข้าแล้ว']);
    }
}
