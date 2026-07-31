<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'slug' => 'monthong-grade-a',
                'name' => 'ทุเรียนหมอนทอง เกรด A',
                'name_en' => 'Monthong Grade A',
                'description' => 'ผลสดจากสวน AuraGold คัดเกรด A เนื้อครีมมี่ หวานมัน ส่งตรงภายใน 24 ชม.',
                'product_type' => 'fresh',
                'badge' => 'พรีเมียม',
                'price' => 180,
                'unit' => 'kg',
                'image_url' => 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800&q=80',
                'rating' => 4.9,
                'review_count' => 240,
                'is_featured' => true,
                'is_hot' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'musang-king-fresh',
                'name' => 'มูซังคิง (D197)',
                'name_en' => 'Musang King',
                'description' => 'รสชาติเข้ม หวานมัน เนื้อสีเหลืองทอง คัดจากแปลงพรีเมียม',
                'product_type' => 'fresh',
                'badge' => 'หายาก',
                'price' => 320,
                'unit' => 'kg',
                'image_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80',
                'rating' => 5.0,
                'review_count' => 88,
                'is_featured' => true,
                'is_hot' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'frozen-iqf-1kg',
                'name' => 'ทุเรียนแช่แข็ง IQF 1 กก.',
                'name_en' => 'Frozen Durian IQF',
                'description' => 'เนื้อทุเรียนแช่แข็ง -18°C เหมาะสำหรับส่งออกและร้านค้า',
                'product_type' => 'frozen',
                'badge' => 'ส่งออก',
                'price' => 350,
                'unit' => 'kg',
                'image_url' => 'https://images.unsplash.com/photo-1615485925516-4c2e4d2e4d2e?w=800&q=80',
                'rating' => 4.8,
                'review_count' => 112,
                'is_featured' => true,
                'is_hot' => true,
                'sort_order' => 3,
            ],
            [
                'slug' => 'dried-monthong',
                'name' => 'ทุเรียนอบแห้งหมอนทอง',
                'name_en' => 'Dried Monthong',
                'description' => 'อบแห้งควบคุมความชื้น บรรจุซองพร้อมทาน',
                'product_type' => 'dried',
                'badge' => 'ของฝาก',
                'price' => 450,
                'unit' => 'pack',
                'image_url' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476b?w=800&q=80',
                'rating' => 4.7,
                'review_count' => 56,
                'is_featured' => true,
                'is_hot' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                [
                    ...$product,
                    'stock_qty' => $product['stock_qty'] ?? 999,
                    'weight_kg' => $product['weight_kg'] ?? ($product['unit'] === 'kg' ? 3 : null),
                    'tagline' => $product['tagline'] ?? 'ของแท้ 100% ไม่พูดมากอยากกินก็สั่งมา',
                    'seller_name' => $product['seller_name'] ?? 'สวนทุเรียนคงศิลา',
                    'seller_phone' => $product['seller_phone'] ?? '0641286178',
                ]
            );
        }
    }
}
