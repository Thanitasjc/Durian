<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductionBatch;
use App\Services\NumberingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductionBatchController extends Controller
{
    public function __construct(private NumberingService $numbering) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProductionBatch::query()->with('lot')->latest();
        if ($request->filled('product_type')) {
            $query->where('product_type', $request->string('product_type'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lot_id' => ['nullable', 'exists:lots,id'],
            'product_type' => ['required', 'in:fresh,flesh,frozen,dried'],
            'input_weight' => ['required', 'numeric', 'min:0'],
            'output_weight' => ['nullable', 'numeric', 'min:0'],
            'production_date' => ['nullable', 'date'],
            'operator' => ['nullable', 'string', 'max:120'],
            'current_step' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        $input = (float) $data['input_weight'];
        $output = (float) ($data['output_weight'] ?? 0);
        $yield = $input > 0 ? round(($output / $input) * 100, 2) : null;

        $batch = ProductionBatch::query()->create([
            ...$data,
            'batch_number' => $this->numbering->nextBatchNumber($data['product_type']),
            'output_weight' => $output,
            'yield_percent' => $yield,
            'production_date' => $data['production_date'] ?? now()->toDateString(),
            'status' => $data['status'] ?? 'รอเริ่ม',
        ]);

        return response()->json(['data' => $batch->load('lot')], 201);
    }

    public function show(ProductionBatch $productionBatch): JsonResponse
    {
        return response()->json(['data' => $productionBatch->load('lot')]);
    }

    public function update(Request $request, ProductionBatch $productionBatch): JsonResponse
    {
        $data = $request->validate([
            'lot_id' => ['nullable', 'exists:lots,id'],
            'product_type' => ['sometimes', 'in:fresh,flesh,frozen,dried'],
            'input_weight' => ['sometimes', 'numeric', 'min:0'],
            'output_weight' => ['nullable', 'numeric', 'min:0'],
            'production_date' => ['nullable', 'date'],
            'operator' => ['nullable', 'string', 'max:120'],
            'current_step' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        $productionBatch->fill($data);
        $input = (float) $productionBatch->input_weight;
        $output = (float) $productionBatch->output_weight;
        $productionBatch->yield_percent = $input > 0 ? round(($output / $input) * 100, 2) : null;
        $productionBatch->save();

        return response()->json(['data' => $productionBatch->fresh('lot')]);
    }

    public function destroy(ProductionBatch $productionBatch): JsonResponse
    {
        $productionBatch->delete();

        return response()->json(['message' => 'ลบ Batch แล้ว']);
    }
}
