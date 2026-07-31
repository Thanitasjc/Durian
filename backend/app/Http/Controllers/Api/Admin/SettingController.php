<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Setting::query()->orderBy('group')->orderBy('key')->get(),
        ]);
    }

    public function upsert(Request $request): JsonResponse
    {
        $items = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['nullable', 'string'],
            'settings.*.group' => ['nullable', 'string'],
        ])['settings'];

        foreach ($items as $item) {
            Setting::query()->updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'] ?? null,
                    'group' => $item['group'] ?? 'general',
                ]
            );
        }

        return response()->json([
            'data' => Setting::query()->orderBy('group')->orderBy('key')->get(),
            'message' => 'บันทึกการตั้งค่าแล้ว',
        ]);
    }
}
