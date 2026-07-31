<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Harvest;
use App\Models\Lot;
use App\Models\Plot;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HarvestController extends Controller
{
    public function __construct(private NumberingService $numbering) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Harvest::query()->with(['farm', 'plot', 'lot'])->latest('harvest_date')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'farm_id' => ['required', 'exists:farms,id'],
            'plot_id' => ['required', 'exists:plots,id'],
            'harvest_date' => ['required', 'date'],
            'variety' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0'],
            'total_weight' => ['required', 'numeric', 'min:0'],
            'harvest_team' => ['nullable', 'string', 'max:180'],
            'notes' => ['nullable', 'string'],
        ]);

        $harvest = DB::transaction(function () use ($data) {
            $plot = Plot::query()->findOrFail($data['plot_id']);
            $variety = $data['variety'] ?? $plot->variety;

            $lot = Lot::query()->create([
                'lot_number' => $this->numbering->nextLotNumber(),
                'farm_id' => $data['farm_id'],
                'plot_id' => $data['plot_id'],
                'variety' => $variety,
                'harvest_date' => $data['harvest_date'],
                'quantity' => $data['quantity'],
                'total_weight' => $data['total_weight'],
                'status' => 'created',
            ]);

            return Harvest::query()->create([
                ...$data,
                'variety' => $variety,
                'lot_id' => $lot->id,
                'status' => 'รอเข้าคลังรับ',
            ]);
        });

        return response()->json(['data' => $harvest->load(['farm', 'plot', 'lot'])], 201);
    }

    public function show(Harvest $harvest): JsonResponse
    {
        return response()->json(['data' => $harvest->load(['farm', 'plot', 'lot'])]);
    }

    public function update(Request $request, Harvest $harvest): JsonResponse
    {
        $data = $request->validate([
            'farm_id' => ['sometimes', 'exists:farms,id'],
            'plot_id' => ['sometimes', 'exists:plots,id'],
            'harvest_date' => ['sometimes', 'date'],
            'variety' => ['nullable', 'string', 'max:100'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'total_weight' => ['sometimes', 'numeric', 'min:0'],
            'harvest_team' => ['nullable', 'string', 'max:180'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        $harvest->update($data);

        if ($harvest->lot && (isset($data['quantity']) || isset($data['total_weight']) || isset($data['variety']))) {
            $harvest->lot->update([
                'quantity' => $harvest->quantity,
                'total_weight' => $harvest->total_weight,
                'variety' => $harvest->variety,
                'harvest_date' => $harvest->harvest_date,
            ]);
        }

        return response()->json(['data' => $harvest->fresh(['farm', 'plot', 'lot'])]);
    }

    public function destroy(Harvest $harvest): JsonResponse
    {
        $harvest->delete();

        return response()->json(['message' => 'ลบรายการเก็บเกี่ยวแล้ว']);
    }
}
