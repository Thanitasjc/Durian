<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Farm;
use App\Models\Harvest;
use App\Models\InventoryItem;
use App\Models\Lot;
use App\Models\Order;
use App\Models\Plot;
use App\Models\ProductionBatch;
use App\Models\QualityInspection;
use App\Models\Receiving;
use App\Models\Setting;
use App\Models\Tree;
use App\Models\User;
use App\Services\NumberingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminDemoSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@auragold.test'],
            [
                'name' => 'ผู้ดูแลระบบ',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        Setting::query()->updateOrCreate(
            ['key' => 'company_name'],
            ['value' => 'สวนทุเรียนและศูนย์แปรรูป ออร่าโกลด์', 'group' => 'company']
        );
        Setting::query()->updateOrCreate(
            ['key' => 'lot_format'],
            ['value' => 'LOT-{YYYY}-{0000}', 'group' => 'numbering']
        );
        Setting::query()->updateOrCreate(
            ['key' => 'site_brand_primary'],
            ['value' => 'AuraGold', 'group' => 'branding']
        );
        Setting::query()->updateOrCreate(
            ['key' => 'site_brand_accent'],
            ['value' => 'Durian', 'group' => 'branding']
        );
        Setting::query()->updateOrCreate(
            ['key' => 'site_brand_mode'],
            ['value' => 'text', 'group' => 'branding']
        );
        Setting::query()->updateOrCreate(
            ['key' => 'site_logo_url'],
            ['value' => null, 'group' => 'branding']
        );

        foreach (
            [
                'header_show_account' => '1',
                'header_show_search' => '1',
                'header_show_compare' => '1',
                'header_show_wishlist' => '1',
                'header_show_cart' => '1',
            ] as $key => $value
        ) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => 'header']
            );
        }

        if (\App\Models\NavItem::query()->count() === 0) {
            $products = \App\Models\NavItem::query()->create([
                'label' => 'สินค้า',
                'href' => '/products',
                'sort_order' => 20,
                'is_active' => true,
            ]);

            $roots = [
                ['label' => 'หน้าแรก', 'href' => '/', 'sort_order' => 10],
                ['label' => 'เยี่ยมชมสวน', 'href' => '/tours', 'sort_order' => 30],
                ['label' => 'ตรวจสอบย้อนกลับ', 'href' => '/trace', 'sort_order' => 40],
                ['label' => 'ติดต่อเรา', 'href' => '/contact', 'sort_order' => 50],
            ];
            foreach ($roots as $row) {
                \App\Models\NavItem::query()->create([
                    ...$row,
                    'is_active' => true,
                ]);
            }

            $children = [
                ['label' => 'ทุเรียนสด', 'href' => '/products?type=fresh', 'sort_order' => 10],
                ['label' => 'เนื้อสด', 'href' => '/products?type=flesh', 'sort_order' => 20],
                ['label' => 'แช่แข็ง', 'href' => '/products?type=frozen', 'sort_order' => 30],
                ['label' => 'อบแห้ง', 'href' => '/products?type=dried', 'sort_order' => 40],
                ['label' => 'สินค้าทั้งหมด', 'href' => '/products', 'sort_order' => 50],
            ];
            foreach ($children as $row) {
                \App\Models\NavItem::query()->create([
                    ...$row,
                    'parent_id' => $products->id,
                    'is_active' => true,
                ]);
            }
        }

        $farm = Farm::query()->updateOrCreate(
            ['code' => 'FARM-A'],
            [
                'name' => 'สวน AuraGold',
                'location' => 'จันทบุรี',
                'area_rai' => 145,
                'map_image_url' => '/samples/orchard-map.svg',
                'map_provider' => 'image',
                'map_lat' => 12.6113000,
                'map_lng' => 102.1038000,
                'map_zoom' => 16,
                'is_active' => true,
            ]
        );

        $plots = [
            [
                'code' => 'A01',
                'name' => 'Section A (Valley)',
                'variety' => 'หมอนทอง',
                'tree_count' => 450,
                'avg_tree_age' => 12,
                'flowering_date' => '2026-01-15',
                'fruit_status' => 'พร้อมเก็บ',
                'expected_harvest_date' => '2026-05-10',
                'development_percent' => 85,
                'map_x' => 8,
                'map_y' => 12,
                'map_w' => 26,
                'map_h' => 28,
                'map_geometry' => [
                    'type' => 'rectangle',
                    'bounds' => [
                        'north' => 12.6132,
                        'south' => 12.6118,
                        'east' => 102.1050,
                        'west' => 102.1028,
                    ],
                ],
                'soil_moisture' => 68,
                'alert_level' => 'none',
            ],
            [
                'code' => 'B01',
                'name' => 'Section B (Slopes)',
                'variety' => 'หมอนทอง',
                'tree_count' => 320,
                'avg_tree_age' => 10,
                'flowering_date' => '2026-01-20',
                'fruit_status' => 'ใกล้เก็บ',
                'expected_harvest_date' => '2026-05-18',
                'development_percent' => 72,
                'map_x' => 38,
                'map_y' => 12,
                'map_w' => 26,
                'map_h' => 28,
                'map_geometry' => [
                    'type' => 'rectangle',
                    'bounds' => [
                        'north' => 12.6132,
                        'south' => 12.6118,
                        'east' => 102.1072,
                        'west' => 102.1050,
                    ],
                ],
                'soil_moisture' => 12,
                'alert_level' => 'critical',
            ],
            [
                'code' => 'C01',
                'name' => 'Section C (Ridge)',
                'variety' => 'มูซังคิง',
                'tree_count' => 180,
                'avg_tree_age' => 8,
                'flowering_date' => '2026-02-01',
                'fruit_status' => 'ติดผล',
                'expected_harvest_date' => '2026-06-01',
                'development_percent' => 60,
                'map_x' => 68,
                'map_y' => 12,
                'map_w' => 24,
                'map_h' => 28,
                'map_geometry' => [
                    'type' => 'polygon',
                    'paths' => [
                        ['lat' => 12.6132, 'lng' => 102.1072],
                        ['lat' => 12.6132, 'lng' => 102.1092],
                        ['lat' => 12.6118, 'lng' => 102.1090],
                        ['lat' => 12.6119, 'lng' => 102.1070],
                    ],
                ],
                'soil_moisture' => 42,
                'alert_level' => 'warning',
            ],
            [
                'code' => 'D01',
                'name' => 'Section D (Main Grove)',
                'variety' => 'หมอนทอง',
                'tree_count' => 510,
                'avg_tree_age' => 14,
                'flowering_date' => '2026-01-10',
                'fruit_status' => 'พร้อมเก็บ',
                'expected_harvest_date' => '2026-05-05',
                'development_percent' => 90,
                'map_x' => 8,
                'map_y' => 48,
                'map_w' => 26,
                'map_h' => 30,
                'map_geometry' => [
                    'type' => 'rectangle',
                    'bounds' => [
                        'north' => 12.6118,
                        'south' => 12.6102,
                        'east' => 102.1050,
                        'west' => 102.1028,
                    ],
                ],
                'soil_moisture' => 55,
                'alert_level' => 'none',
            ],
            [
                'code' => 'E01',
                'name' => 'Section E (East Block)',
                'variety' => 'ก้านยาว',
                'tree_count' => 240,
                'avg_tree_age' => 9,
                'flowering_date' => '2026-01-25',
                'fruit_status' => 'ติดผล',
                'expected_harvest_date' => '2026-05-25',
                'development_percent' => 65,
                'map_x' => 38,
                'map_y' => 48,
                'map_w' => 26,
                'map_h' => 30,
                'map_geometry' => [
                    'type' => 'rectangle',
                    'bounds' => [
                        'north' => 12.6118,
                        'south' => 12.6102,
                        'east' => 102.1072,
                        'west' => 102.1050,
                    ],
                ],
                'soil_moisture' => 50,
                'alert_level' => 'none',
            ],
            [
                'code' => 'F01',
                'name' => 'Section F (Nursery)',
                'variety' => 'หมอนทอง',
                'tree_count' => 90,
                'avg_tree_age' => 3,
                'flowering_date' => null,
                'fruit_status' => 'ยังไม่ติดผล',
                'expected_harvest_date' => null,
                'development_percent' => 20,
                'map_x' => 68,
                'map_y' => 48,
                'map_w' => 24,
                'map_h' => 30,
                'map_geometry' => [
                    'type' => 'rectangle',
                    'bounds' => [
                        'north' => 12.6118,
                        'south' => 12.6102,
                        'east' => 102.1092,
                        'west' => 102.1072,
                    ],
                ],
                'soil_moisture' => 61,
                'alert_level' => 'none',
            ],
        ];

        $plot = null;
        foreach ($plots as $plotData) {
            $created = Plot::query()->updateOrCreate(
                ['farm_id' => $farm->id, 'code' => $plotData['code']],
                array_merge($plotData, ['farm_id' => $farm->id])
            );
            if ($plotData['code'] === 'A01') {
                $plot = $created;
            }
        }

        $plot ??= Plot::query()->where('farm_id', $farm->id)->where('code', 'A01')->firstOrFail();

        Tree::query()->updateOrCreate(
            ['plot_id' => $plot->id, 'code' => 'A01-01'],
            ['variety' => 'หมอนทอง', 'age_years' => 12, 'health_status' => 'healthy']
        );

        $numbering = app(NumberingService::class);

        if (! Lot::query()->where('lot_number', 'LOT-2026-0001')->exists()) {
            $lot = Lot::query()->create([
                'lot_number' => 'LOT-2026-0001',
                'farm_id' => $farm->id,
                'plot_id' => $plot->id,
                'variety' => 'หมอนทอง',
                'harvest_date' => '2026-07-27',
                'quantity' => 380,
                'total_weight' => 1200,
                'status' => 'qc_passed',
            ]);

            Harvest::query()->create([
                'farm_id' => $farm->id,
                'plot_id' => $plot->id,
                'lot_id' => $lot->id,
                'harvest_date' => '2026-07-27',
                'variety' => 'หมอนทอง',
                'quantity' => 380,
                'total_weight' => 1200,
                'harvest_team' => 'ทีมช่างตัด A',
                'status' => 'รับเข้าแล้ว',
            ]);

            $receiving = Receiving::query()->create([
                'receiving_number' => 'REC-2026-001',
                'lot_id' => $lot->id,
                'farm_id' => $farm->id,
                'plot_id' => $plot->id,
                'harvest_date' => '2026-07-27',
                'received_at' => now(),
                'quantity' => 380,
                'total_weight' => 1195.5,
                'receiver' => 'วิชัย ชั่งดี',
                'status' => 'รับเข้าแล้ว',
            ]);

            QualityInspection::query()->create([
                'lot_id' => $lot->id,
                'receiving_id' => $receiving->id,
                'inspected_at' => now(),
                'inspector' => 'QC สมหญิง',
                'grade_a_weight' => 550,
                'grade_b_weight' => 320,
                'processing_weight' => 280,
                'reject_weight' => 45.5,
                'brix' => '38.2',
                'allocation_path' => 'flesh',
                'status' => 'อนุมัติ',
            ]);

            ProductionBatch::query()->create([
                'batch_number' => 'FLESH-2026-001',
                'lot_id' => $lot->id,
                'product_type' => 'flesh',
                'input_weight' => 300,
                'output_weight' => 99,
                'yield_percent' => 33,
                'production_date' => '2026-07-27',
                'operator' => 'สมชาย',
                'current_step' => 'แช่เย็น',
                'status' => 'เสร็จสิ้น',
            ]);
        }

        // คลังสินค้าตัวอย่าง — 1 รายการต่อสินค้าบนเว็บ
        $webInventory = [
            'monthong-grade-a' => [
                'lot_number' => 'LOT-WEB-MONTHONG',
                'name' => 'ทุเรียนหมอนทอง เกรด A (คลัง)',
                'quantity' => 600,
                'unit' => 'kg',
                'storage_zone' => 'fresh',
                'location' => 'โซน A1',
                'weight_kg' => 3,
            ],
            'musang-king-fresh' => [
                'lot_number' => 'LOT-WEB-MUSANG',
                'name' => 'มูซังคิง D197 (คลัง)',
                'quantity' => 240,
                'unit' => 'kg',
                'storage_zone' => 'fresh',
                'location' => 'โซน A2',
                'weight_kg' => 2.5,
            ],
            'frozen-iqf-1kg' => [
                'lot_number' => 'LOT-WEB-IQF',
                'name' => 'ทุเรียนแช่แข็ง IQF 1 กก. (คลัง)',
                'quantity' => 320,
                'unit' => 'kg',
                'storage_zone' => 'frozen',
                'location' => 'ฟรีเซอร์ B1',
                'weight_kg' => 1,
            ],
            'dried-monthong' => [
                'lot_number' => 'LOT-WEB-DRIED',
                'name' => 'ทุเรียนอบแห้งหมอนทอง (คลัง)',
                'quantity' => 180,
                'unit' => 'pack',
                'storage_zone' => 'dry',
                'location' => 'ชั้น D2',
                'weight_kg' => null,
            ],
        ];

        // เก็บรายการคลังเดิมไว้ด้วย (ไม่ผูกเว็บ)
        InventoryItem::query()->updateOrCreate(
            ['name' => 'ทุเรียนผลสด เกรด A', 'lot_number' => 'LOT-2026-0001'],
            [
                'category' => 'finished',
                'product_type' => 'fresh',
                'quantity' => 550,
                'unit' => 'kg',
                'storage_zone' => 'fresh',
                'location' => 'โซน A1',
                'expiry_date' => '2026-08-03',
                'rotation_method' => 'FEFO',
            ]
        );

        $stockService = app(\App\Services\StockService::class);
        foreach ($webInventory as $slug => $cfg) {
            $product = \App\Models\Product::query()->where('slug', $slug)->first();
            if (! $product) {
                continue;
            }

            $item = InventoryItem::query()->updateOrCreate(
                ['lot_number' => $cfg['lot_number']],
                [
                    'name' => $cfg['name'],
                    'category' => 'finished',
                    'product_type' => $product->product_type,
                    'quantity' => $cfg['quantity'],
                    'unit' => $cfg['unit'],
                    'storage_zone' => $cfg['storage_zone'],
                    'location' => $cfg['location'],
                    'expiry_date' => now()->addDays(14)->toDateString(),
                    'rotation_method' => 'FEFO',
                ]
            );

            $product->update([
                'inventory_item_id' => $item->id,
                'weight_kg' => $cfg['weight_kg'],
            ]);
            $stockService->syncProductStockFromInventory($product->fresh('inventoryItem'));
        }

        $customer = Customer::query()->updateOrCreate(
            ['code' => 'CUS-0001'],
            [
                'name' => 'ร้านทุเรียนทองคำ จันทบุรี',
                'phone' => '0812345678',
                'type' => 'wholesale',
            ]
        );

        if (! Order::query()->where('order_number', 'ORD-2026-001')->exists()) {
            Order::query()->create([
                'order_number' => 'ORD-2026-001',
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'product_name' => 'ทุเรียนสด เกรด A',
                'product_type' => 'fresh',
                'quantity' => 200,
                'unit' => 'kg',
                'total_amount' => 36000,
                'status' => 'กำลังเตรียมสินค้า',
                'order_date' => now()->toDateString(),
            ]);
        }

        // silence unused in case numbering not needed for fixed demo codes
        unset($numbering);
    }
}
