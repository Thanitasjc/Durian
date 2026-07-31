<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\NavItem;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class HeaderController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $roots = NavItem::query()
            ->active()
            ->roots()
            ->with(['children' => fn ($q) => $q->active()->orderBy('sort_order')->orderBy('id')])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $nav = $roots->map(fn (NavItem $item) => [
            'id' => $item->id,
            'label' => $item->label,
            'href' => $item->href ?: '/',
            'children' => $item->children->map(fn (NavItem $child) => [
                'id' => $child->id,
                'label' => $child->label,
                'href' => $child->href ?: '/',
            ])->values(),
        ])->values();

        $keys = [
            'header_show_account',
            'header_show_search',
            'header_show_compare',
            'header_show_wishlist',
            'header_show_cart',
        ];

        $settings = Setting::query()
            ->whereIn('key', $keys)
            ->pluck('value', 'key');

        $flag = static fn (string $key): bool => filter_var(
            $settings[$key] ?? '1',
            FILTER_VALIDATE_BOOLEAN
        );

        return response()->json([
            'data' => [
                'nav' => $nav,
                'toolbar' => [
                    'account' => $flag('header_show_account'),
                    'search' => $flag('header_show_search'),
                    'compare' => $flag('header_show_compare'),
                    'wishlist' => $flag('header_show_wishlist'),
                    'cart' => $flag('header_show_cart'),
                ],
            ],
        ]);
    }
}
