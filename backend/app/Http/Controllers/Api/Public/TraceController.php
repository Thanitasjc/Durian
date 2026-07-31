<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TraceController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $code = strtoupper(trim((string) $request->query('code', '')));

        if ($code === '') {
            return response()->json([
                'message' => 'กรุณาระบุรหัส LOT หรือ Batch',
            ], 422);
        }

        $timeline = $this->demoTimeline($code);

        if ($timeline === null) {
            return response()->json([
                'message' => 'ไม่พบข้อมูลตรวจสอบย้อนกลับสำหรับรหัสนี้',
                'code' => $code,
            ], 404);
        }

        return response()->json([
            'data' => [
                'code' => $code,
                'timeline' => $timeline,
            ],
        ]);
    }

    /**
     * @return array<int, array<string, string>>|null
     */
    private function demoTimeline(string $code): ?array
    {
        $samples = [
            'LOT-2026-0084' => [
                ['step' => 'farm', 'title' => 'จุดกำเนิดแปลงสวน', 'detail' => 'สวน AuraGold · แปลง A01 (หมอนทองเนินเขา)'],
                ['step' => 'harvest', 'title' => 'การเก็บเกี่ยว', 'detail' => '27/07/2026 06:30 · 380 ลูก · 1,200 กก.'],
                ['step' => 'lot', 'title' => 'รหัส LOT', 'detail' => 'LOT-2026-0084'],
                ['step' => 'qc', 'title' => 'ตรวจคุณภาพ', 'detail' => 'เกรด A 550 กก. · เกรด B 320 กก. · Brix เฉลี่ย 38.2°'],
                ['step' => 'processing', 'title' => 'การแปรรูป', 'detail' => 'FLESH-2026-044 · Yield 33%'],
                ['step' => 'product', 'title' => 'สินค้าสำเร็จรูป', 'detail' => 'เนื้อทุเรียนสดถาด 500g'],
                ['step' => 'order', 'title' => 'คำสั่งซื้อ', 'detail' => 'ORD-2026-101 · ร้านทุเรียนทองคำ จันทบุรี'],
            ],
        ];

        if (isset($samples[$code])) {
            return $samples[$code];
        }

        if (str_starts_with($code, 'LOT-') || str_starts_with($code, 'FROZEN-') || str_starts_with($code, 'FLESH-')) {
            return [
                ['step' => 'farm', 'title' => 'จุดกำเนิดแปลงสวน', 'detail' => 'สวน AuraGold · แปลงต้นทาง'],
                ['step' => 'harvest', 'title' => 'การเก็บเกี่ยว', 'detail' => 'บันทึกในฤดูกาล 2026'],
                ['step' => 'lot', 'title' => 'รหัสติดตาม', 'detail' => $code],
                ['step' => 'qc', 'title' => 'ตรวจคุณภาพ', 'detail' => 'ผ่านมาตรฐานคัดเกรดของโรงงาน'],
            ];
        }

        return null;
    }
}
