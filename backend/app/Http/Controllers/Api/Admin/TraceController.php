<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Harvest;
use App\Models\Lot;
use App\Models\Order;
use App\Models\ProductionBatch;
use App\Models\QualityInspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TraceController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $code = strtoupper(trim((string) $request->query('code', '')));
        if ($code === '') {
            return response()->json(['message' => 'กรุณาระบุรหัส'], 422);
        }

        $lot = Lot::query()
            ->with(['farm', 'plot'])
            ->where('lot_number', $code)
            ->first();

        $batch = ProductionBatch::query()
            ->with('lot.farm', 'lot.plot')
            ->where('batch_number', $code)
            ->first();

        if (! $lot && $batch?->lot) {
            $lot = $batch->lot;
        }

        if (! $lot && ! $batch) {
            return response()->json(['message' => 'ไม่พบข้อมูล', 'code' => $code], 404);
        }

        $timeline = [];

        if ($lot) {
            if ($lot->farm) {
                $timeline[] = [
                    'step' => 'farm',
                    'title' => 'ฟาร์ม',
                    'detail' => $lot->farm->name.' ('.$lot->farm->code.')',
                ];
            }
            if ($lot->plot) {
                $timeline[] = [
                    'step' => 'plot',
                    'title' => 'แปลง',
                    'detail' => $lot->plot->code.' · '.$lot->plot->name,
                ];
            }

            $harvest = Harvest::query()->where('lot_id', $lot->id)->first();
            if ($harvest) {
                $timeline[] = [
                    'step' => 'harvest',
                    'title' => 'เก็บเกี่ยว',
                    'detail' => $harvest->harvest_date?->format('d/m/Y').' · '.$harvest->total_weight.' กก.',
                ];
            }

            $timeline[] = [
                'step' => 'lot',
                'title' => 'LOT',
                'detail' => $lot->lot_number.' · '.$lot->variety,
            ];

            $qc = QualityInspection::query()->where('lot_id', $lot->id)->latest()->first();
            if ($qc) {
                $timeline[] = [
                    'step' => 'qc',
                    'title' => 'ตรวจคุณภาพ',
                    'detail' => "A {$qc->grade_a_weight} / B {$qc->grade_b_weight} / Proc {$qc->processing_weight} / Reject {$qc->reject_weight}",
                ];
            }

            $batches = ProductionBatch::query()->where('lot_id', $lot->id)->get();
            foreach ($batches as $b) {
                $timeline[] = [
                    'step' => 'processing',
                    'title' => 'แปรรูป',
                    'detail' => "{$b->batch_number} · Yield {$b->yield_percent}%",
                ];
            }
        } elseif ($batch) {
            $timeline[] = [
                'step' => 'processing',
                'title' => 'แปรรูป',
                'detail' => "{$batch->batch_number} · Yield {$batch->yield_percent}%",
            ];
        }

        $orders = Order::query()->latest()->limit(3)->get();
        foreach ($orders as $order) {
            $timeline[] = [
                'step' => 'order',
                'title' => 'คำสั่งซื้อ',
                'detail' => "{$order->order_number} · {$order->customer_name} · {$order->status}",
            ];
            break;
        }

        return response()->json([
            'data' => [
                'code' => $code,
                'lot' => $lot,
                'batch' => $batch,
                'timeline' => $timeline,
            ],
        ]);
    }
}
