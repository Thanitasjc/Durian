<?php

namespace App\Services;

use App\Models\Lot;
use App\Models\Order;
use App\Models\ProductionBatch;
use App\Models\Receiving;
use Illuminate\Support\Facades\DB;

class NumberingService
{
    public function nextLotNumber(?int $year = null): string
    {
        $year ??= (int) now()->format('Y');
        $prefix = "LOT-{$year}-";

        $last = Lot::query()
            ->where('lot_number', 'like', $prefix.'%')
            ->orderByDesc('lot_number')
            ->value('lot_number');

        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix.str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }

    public function nextReceivingNumber(?int $year = null): string
    {
        $year ??= (int) now()->format('Y');
        $prefix = "REC-{$year}-";

        $last = Receiving::query()
            ->where('receiving_number', 'like', $prefix.'%')
            ->orderByDesc('receiving_number')
            ->value('receiving_number');

        $seq = $last ? ((int) substr($last, -3)) + 1 : 1;

        return $prefix.str_pad((string) $seq, 3, '0', STR_PAD_LEFT);
    }

    public function nextBatchNumber(string $productType, ?int $year = null): string
    {
        $year ??= (int) now()->format('Y');
        $map = [
            'fresh' => 'FRESH',
            'flesh' => 'FLESH',
            'frozen' => 'FROZEN',
            'dried' => 'DRIED',
        ];
        $code = $map[$productType] ?? strtoupper($productType);
        $prefix = "{$code}-{$year}-";

        $last = ProductionBatch::query()
            ->where('batch_number', 'like', $prefix.'%')
            ->orderByDesc('batch_number')
            ->value('batch_number');

        $seq = $last ? ((int) substr($last, -3)) + 1 : 1;

        return $prefix.str_pad((string) $seq, 3, '0', STR_PAD_LEFT);
    }

    public function nextOrderNumber(?int $year = null): string
    {
        $year ??= (int) now()->format('Y');
        $prefix = "ORD-{$year}-";

        $last = Order::query()
            ->where('order_number', 'like', $prefix.'%')
            ->orderByDesc('order_number')
            ->value('order_number');

        $seq = $last ? ((int) substr($last, -3)) + 1 : 1;

        return $prefix.str_pad((string) $seq, 3, '0', STR_PAD_LEFT);
    }

    public function nextCustomerCode(): string
    {
        $last = DB::table('customers')->orderByDesc('id')->value('code');
        $seq = $last && preg_match('/(\d+)$/', $last, $m) ? ((int) $m[1]) + 1 : 1;

        return 'CUS-'.str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }
}
