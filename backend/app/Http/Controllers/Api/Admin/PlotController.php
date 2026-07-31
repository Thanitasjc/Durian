<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Plot::query()->with('farm')->latest();

        if ($request->filled('farm_id')) {
            $query->where('farm_id', $request->integer('farm_id'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'farm_id' => ['required', 'exists:farms,id'],
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:180'],
            'variety' => ['nullable', 'string', 'max:100'],
            'tree_count' => ['nullable', 'integer', 'min:0'],
            'avg_tree_age' => ['nullable', 'numeric'],
            'flowering_date' => ['nullable', 'date'],
            'fruit_status' => ['nullable', 'string', 'max:100'],
            'expected_harvest_date' => ['nullable', 'date'],
            'development_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
            'map_x' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'map_y' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'map_w' => ['nullable', 'numeric', 'min:1', 'max:100'],
            'map_h' => ['nullable', 'numeric', 'min:1', 'max:100'],
            'map_geometry' => ['nullable', 'array'],
            'map_geometry.type' => ['nullable', 'in:rectangle,polygon'],
            'map_geometry.bounds' => ['nullable', 'array'],
            'map_geometry.paths' => ['nullable', 'array'],
            'soil_moisture' => ['nullable', 'integer', 'min:0', 'max:100'],
            'alert_level' => ['nullable', 'in:none,warning,critical'],
        ]);

        $plot = Plot::query()->create($data);

        return response()->json(['data' => $plot->load('farm')], 201);
    }

    public function show(Plot $plot): JsonResponse
    {
        return response()->json(['data' => $plot->load(['farm', 'trees'])]);
    }

    public function update(Request $request, Plot $plot): JsonResponse
    {
        $data = $request->validate([
            'farm_id' => ['sometimes', 'exists:farms,id'],
            'code' => ['sometimes', 'string', 'max:50'],
            'name' => ['sometimes', 'string', 'max:180'],
            'variety' => ['nullable', 'string', 'max:100'],
            'tree_count' => ['nullable', 'integer', 'min:0'],
            'avg_tree_age' => ['nullable', 'numeric'],
            'flowering_date' => ['nullable', 'date'],
            'fruit_status' => ['nullable', 'string', 'max:100'],
            'expected_harvest_date' => ['nullable', 'date'],
            'development_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
            'map_x' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'map_y' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'map_w' => ['nullable', 'numeric', 'min:1', 'max:100'],
            'map_h' => ['nullable', 'numeric', 'min:1', 'max:100'],
            'map_geometry' => ['nullable', 'array'],
            'map_geometry.type' => ['nullable', 'in:rectangle,polygon'],
            'map_geometry.bounds' => ['nullable', 'array'],
            'map_geometry.paths' => ['nullable', 'array'],
            'soil_moisture' => ['nullable', 'integer', 'min:0', 'max:100'],
            'alert_level' => ['nullable', 'in:none,warning,critical'],
        ]);

        $plot->update($data);

        return response()->json(['data' => $plot->fresh('farm')]);
    }

    public function destroy(Plot $plot): JsonResponse
    {
        $plot->delete();

        return response()->json(['message' => 'ลบแปลงแล้ว']);
    }
}
