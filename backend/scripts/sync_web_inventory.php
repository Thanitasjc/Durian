<?php

use App\Models\InventoryItem;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$stock = app(StockService::class);

$catalog = [
    'monthong-grade-a' => [
        'inv_name' => 'ทุเรียนหมอนทอง เกรด A (คลัง)',
        'category' => 'finished',
        'product_type' => 'fresh',
        'quantity' => 600,
        'unit' => 'kg',
        'storage_zone' => 'fresh',
        'location' => 'โซน A1',
        'lot_number' => 'LOT-WEB-MONTHONG',
        'weight_kg' => 3,
    ],
    'musang-king-fresh' => [
        'inv_name' => 'มูซังคิง D197 (คลัง)',
        'category' => 'finished',
        'product_type' => 'fresh',
        'quantity' => 240,
        'unit' => 'kg',
        'storage_zone' => 'fresh',
        'location' => 'โซน A2',
        'lot_number' => 'LOT-WEB-MUSANG',
        'weight_kg' => 2.5,
    ],
    'frozen-iqf-1kg' => [
        'inv_name' => 'ทุเรียนแช่แข็ง IQF 1 กก. (คลัง)',
        'category' => 'finished',
        'product_type' => 'frozen',
        'quantity' => 320,
        'unit' => 'kg',
        'storage_zone' => 'frozen',
        'location' => 'ฟรีเซอร์ B1',
        'lot_number' => 'LOT-WEB-IQF',
        'weight_kg' => 1,
    ],
    'dried-monthong' => [
        'inv_name' => 'ทุเรียนอบแห้งหมอนทอง (คลัง)',
        'category' => 'finished',
        'product_type' => 'dried',
        'quantity' => 180,
        'unit' => 'pack',
        'storage_zone' => 'dry',
        'location' => 'ชั้น D2',
        'lot_number' => 'LOT-WEB-DRIED',
        'weight_kg' => null,
    ],
];

// Also cover any extra products by slug/name match
foreach (Product::query()->orderBy('id')->get() as $product) {
    $cfg = $catalog[$product->slug] ?? [
        'inv_name' => $product->name.' (คลัง)',
        'category' => 'finished',
        'product_type' => $product->product_type,
        'quantity' => 100,
        'unit' => $product->unit === 'pack' ? 'pack' : 'kg',
        'storage_zone' => match ($product->product_type) {
            'frozen' => 'frozen',
            'dried' => 'dry',
            default => 'fresh',
        },
        'location' => 'โซนทั่วไป',
        'lot_number' => 'LOT-WEB-'.$product->id,
        'weight_kg' => $product->weight_kg,
    ];

    $item = InventoryItem::query()->updateOrCreate(
        ['lot_number' => $cfg['lot_number']],
        [
            'name' => $cfg['inv_name'],
            'category' => $cfg['category'],
            'product_type' => $cfg['product_type'],
            'quantity' => $cfg['quantity'],
            'unit' => $cfg['unit'],
            'storage_zone' => $cfg['storage_zone'],
            'location' => $cfg['location'],
            'rotation_method' => 'FEFO',
            'expiry_date' => now()->addDays(14)->toDateString(),
        ]
    );

    if (! StockMovement::query()->where('inventory_item_id', $item->id)->where('reference', 'opening-web')->exists()) {
        StockMovement::query()->create([
            'inventory_item_id' => $item->id,
            'movement_type' => 'in',
            'quantity' => $item->quantity,
            'reference' => 'opening-web',
            'note' => 'สต็อกเริ่มต้นสำหรับสินค้าบนเว็บ',
            'created_by' => 'seeder',
        ]);
    }

    $updates = ['inventory_item_id' => $item->id];
    if (array_key_exists('weight_kg', $cfg) && $cfg['weight_kg'] !== null) {
        $updates['weight_kg'] = $cfg['weight_kg'];
    }
    $product->update($updates);
    $stock->syncProductStockFromInventory($product->fresh('inventoryItem'));

    echo "OK {$product->slug} -> inventory #{$item->id} ({$item->name}) stock_qty={$product->fresh()->stock_qty}\n";
}

echo "Done.\n";
