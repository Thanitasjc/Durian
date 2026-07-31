<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LotController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Lot::query()->with(['farm', 'plot'])->latest()->get(),
        ]);
    }

    public function show(Lot $lot): JsonResponse
    {
        return response()->json(['data' => $lot->load(['farm', 'plot', 'harvests'])]);
    }

    public function update(Request $request, Lot $lot): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'string', 'max:50'],
            'variety' => ['nullable', 'string', 'max:100'],
            'quantity' => ['nullable', 'integer'],
            'total_weight' => ['nullable', 'numeric'],
        ]);
        $lot->update($data);

        return response()->json(['data' => $lot->fresh(['farm', 'plot'])]);
    }
}
