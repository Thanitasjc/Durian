<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TreeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tree::query()->with('plot.farm')->latest();
        if ($request->filled('plot_id')) {
            $query->where('plot_id', $request->integer('plot_id'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plot_id' => ['required', 'exists:plots,id'],
            'code' => ['required', 'string', 'max:50'],
            'variety' => ['nullable', 'string', 'max:100'],
            'age_years' => ['nullable', 'numeric'],
            'health_status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        return response()->json(['data' => Tree::query()->create($data)->load('plot')], 201);
    }

    public function show(Tree $tree): JsonResponse
    {
        return response()->json(['data' => $tree->load('plot.farm')]);
    }

    public function update(Request $request, Tree $tree): JsonResponse
    {
        $data = $request->validate([
            'plot_id' => ['sometimes', 'exists:plots,id'],
            'code' => ['sometimes', 'string', 'max:50'],
            'variety' => ['nullable', 'string', 'max:100'],
            'age_years' => ['nullable', 'numeric'],
            'health_status' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);
        $tree->update($data);

        return response()->json(['data' => $tree->fresh('plot')]);
    }

    public function destroy(Tree $tree): JsonResponse
    {
        $tree->delete();

        return response()->json(['message' => 'ลบต้นทุเรียนแล้ว']);
    }
}
