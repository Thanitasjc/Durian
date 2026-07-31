<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FarmActivity::query()->with(['farm', 'plot'])->latest('activity_date');
        if ($request->filled('plot_id')) {
            $query->where('plot_id', $request->integer('plot_id'));
        }
        if ($request->filled('farm_id')) {
            $query->where('farm_id', $request->integer('farm_id'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'farm_id' => ['nullable', 'exists:farms,id'],
            'plot_id' => ['nullable', 'exists:plots,id'],
            'activity_date' => ['required', 'date'],
            'activity_type' => ['required', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:180'],
            'detail' => ['nullable', 'string'],
            'quantity' => ['nullable', 'string', 'max:100'],
            'recorded_by' => ['nullable', 'string', 'max:120'],
        ]);

        return response()->json(['data' => FarmActivity::query()->create($data)], 201);
    }

    public function show(FarmActivity $farmActivity): JsonResponse
    {
        return response()->json(['data' => $farmActivity->load(['farm', 'plot'])]);
    }

    public function update(Request $request, FarmActivity $farmActivity): JsonResponse
    {
        $data = $request->validate([
            'farm_id' => ['nullable', 'exists:farms,id'],
            'plot_id' => ['nullable', 'exists:plots,id'],
            'activity_date' => ['sometimes', 'date'],
            'activity_type' => ['sometimes', 'string', 'max:50'],
            'title' => ['sometimes', 'string', 'max:180'],
            'detail' => ['nullable', 'string'],
            'quantity' => ['nullable', 'string', 'max:100'],
            'recorded_by' => ['nullable', 'string', 'max:120'],
        ]);
        $farmActivity->update($data);

        return response()->json(['data' => $farmActivity->fresh()]);
    }

    public function destroy(FarmActivity $farmActivity): JsonResponse
    {
        $farmActivity->delete();

        return response()->json(['message' => 'ลบกิจกรรมแล้ว']);
    }
}
