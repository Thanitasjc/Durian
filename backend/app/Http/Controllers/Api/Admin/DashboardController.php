<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Harvest;
use App\Models\InventoryItem;
use App\Models\Order;
use App\Models\ProductionBatch;
use App\Models\QualityInspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $seasonYear = (int) now()->format('Y');

        $harvested = (float) Harvest::query()
            ->whereYear('harvest_date', $seasonYear)
            ->sum('total_weight');

        $rawStock = (float) InventoryItem::query()
            ->where('category', 'raw')
            ->sum('quantity');

        $stockByType = InventoryItem::query()
            ->where('category', 'finished')
            ->select('product_type', DB::raw('SUM(quantity) as total'))
            ->groupBy('product_type')
            ->pluck('total', 'product_type');

        $todayProduction = (float) ProductionBatch::query()
            ->whereDate('production_date', today())
            ->sum('output_weight');

        $pendingQc = QualityInspection::query()
            ->whereIn('status', ['รอตรวจ', 'กำลังคัดแยก'])
            ->count();

        $harvestByMonth = Harvest::query()
            ->whereYear('harvest_date', $seasonYear)
            ->get(['harvest_date', 'total_weight'])
            ->groupBy(fn ($h) => (int) $h->harvest_date->format('n'))
            ->map(fn ($rows, $month) => [
                'month' => (int) $month,
                'total' => (float) $rows->sum('total_weight'),
            ])
            ->values();

        $productMix = ProductionBatch::query()
            ->select('product_type', DB::raw('SUM(output_weight) as total'))
            ->groupBy('product_type')
            ->get();

        return response()->json([
            'data' => [
                'kpis' => [
                    'harvested_season' => $harvested,
                    'raw_material' => $rawStock,
                    'fresh_stock' => (float) ($stockByType['fresh'] ?? 0),
                    'flesh_stock' => (float) ($stockByType['flesh'] ?? 0),
                    'frozen_stock' => (float) ($stockByType['frozen'] ?? 0),
                    'dried_stock' => (float) ($stockByType['dried'] ?? 0),
                    'today_production' => $todayProduction,
                    'pending_qc' => $pendingQc,
                ],
                'charts' => [
                    'harvest_by_month' => $harvestByMonth,
                    'product_mix' => $productMix,
                ],
                'recent_orders' => Order::query()->latest()->limit(5)->get(),
                'pending_inspections' => QualityInspection::query()
                    ->with('lot')
                    ->whereIn('status', ['รอตรวจ', 'กำลังคัดแยก'])
                    ->latest()
                    ->limit(5)
                    ->get(),
            ],
        ]);
    }
}
