<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class BrandingController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $keys = [
            'site_logo_url',
            'site_brand_primary',
            'site_brand_accent',
            'site_brand_mode',
        ];

        $settings = Setting::query()
            ->whereIn('key', $keys)
            ->pluck('value', 'key');

        return response()->json([
            'data' => [
                'logo_url' => $settings['site_logo_url'] ?? null,
                'brand_primary' => $settings['site_brand_primary'] ?? 'AuraGold',
                'brand_accent' => $settings['site_brand_accent'] ?? 'Durian',
                'brand_mode' => $settings['site_brand_mode'] ?? 'text', // text|logo|both
            ],
        ]);
    }
}
