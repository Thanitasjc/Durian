<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\QualityInspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QualityInspectionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => QualityInspection::query()->with(['lot', 'receiving'])->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lot_id' => ['nullable', 'exists:lots,id'],
            'receiving_id' => ['nullable', 'exists:receivings,id'],
            'inspected_at' => ['nullable', 'date'],
            'inspector' => ['nullable', 'string', 'max:120'],
            'grade_a_weight' => ['nullable', 'numeric'],
            'grade_b_weight' => ['nullable', 'numeric'],
            'processing_weight' => ['nullable', 'numeric'],
            'reject_weight' => ['nullable', 'numeric'],
            'brix' => ['nullable', 'string', 'max:50'],
            'defects' => ['nullable', 'string'],
            'allocation_path' => ['nullable', 'in:fresh,flesh,frozen,dried'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        $inspection = QualityInspection::query()->create([
            ...$data,
            'inspected_at' => $data['inspected_at'] ?? now(),
            'status' => $data['status'] ?? 'รอตรวจ',
        ]);

        return response()->json(['data' => $inspection->load(['lot', 'receiving'])], 201);
    }

    public function show(QualityInspection $qualityInspection): JsonResponse
    {
        return response()->json(['data' => $qualityInspection->load(['lot', 'receiving'])]);
    }

    public function update(Request $request, QualityInspection $qualityInspection): JsonResponse
    {
        $data = $request->validate([
            'lot_id' => ['nullable', 'exists:lots,id'],
            'receiving_id' => ['nullable', 'exists:receivings,id'],
            'inspected_at' => ['nullable', 'date'],
            'inspector' => ['nullable', 'string', 'max:120'],
            'grade_a_weight' => ['nullable', 'numeric'],
            'grade_b_weight' => ['nullable', 'numeric'],
            'processing_weight' => ['nullable', 'numeric'],
            'reject_weight' => ['nullable', 'numeric'],
            'brix' => ['nullable', 'string', 'max:50'],
            'defects' => ['nullable', 'string'],
            'allocation_path' => ['nullable', 'in:fresh,flesh,frozen,dried'],
            'status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);
        $qualityInspection->update($data);

        if ($qualityInspection->lot && ($data['status'] ?? null) === 'อนุมัติ') {
            $qualityInspection->lot->update(['status' => 'qc_passed']);
        }

        return response()->json(['data' => $qualityInspection->fresh(['lot', 'receiving'])]);
    }

    public function destroy(QualityInspection $qualityInspection): JsonResponse
    {
        $qualityInspection->delete();

        return response()->json(['message' => 'ลบรายการตรวจคุณภาพแล้ว']);
    }
}
