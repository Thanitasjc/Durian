<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FarmController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Farm::query()->withCount('plots')->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:farms,code'],
            'name' => ['required', 'string', 'max:180'],
            'location' => ['nullable', 'string', 'max:255'],
            'area_rai' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
            'map_image_url' => ['nullable', 'string', 'max:500'],
            'map_provider' => ['nullable', 'in:image,google'],
            'map_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'map_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'map_zoom' => ['nullable', 'integer', 'min:3', 'max:21'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = filter_var(
                $data['is_active'],
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            ) ?? (bool) $data['is_active'];
        }

        $farm = Farm::query()->create($data);

        return response()->json(['data' => $farm], 201);
    }

    public function show(Farm $farm): JsonResponse
    {
        return response()->json([
            'data' => $farm->load(['plots.trees']),
        ]);
    }

    public function update(Request $request, Farm $farm): JsonResponse
    {
        $data = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', 'unique:farms,code,'.$farm->id],
            'name' => ['sometimes', 'string', 'max:180'],
            'location' => ['nullable', 'string', 'max:255'],
            'area_rai' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
            'map_image_url' => ['nullable', 'string', 'max:500'],
            'map_provider' => ['nullable', 'in:image,google'],
            'map_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'map_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'map_zoom' => ['nullable', 'integer', 'min:3', 'max:21'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('is_active', $data)) {
            $data['is_active'] = filter_var(
                $data['is_active'],
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            ) ?? (bool) $data['is_active'];
        }

        $farm->update($data);

        return response()->json(['data' => $farm->fresh()]);
    }

    public function destroy(Farm $farm): JsonResponse
    {
        $farm->delete();

        return response()->json(['message' => 'ลบฟาร์มแล้ว']);
    }
}
