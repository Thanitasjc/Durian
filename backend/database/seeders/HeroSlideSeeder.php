<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class HeroSlideSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'title' => 'มาตรฐานทองคำแห่งทุเรียน',
                'subtitle' => 'จากสวนสู่โต๊ะอาหาร',
                'eyebrow' => 'ก่อตั้งปี 1984 · ฤดูกาล 2026',
                'body' => 'ปลูก เก็บเกี่ยว แปรรูป และจัดส่งด้วยระบบ LOT / Batch ตรวจสอบย้อนกลับได้ทุกขั้นตอน',
                'image_url' => 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=1920&q=80',
                'cta_label' => 'ดูสินค้าฤดูกาลนี้',
                'cta_link' => '/products',
                'cta_label_2' => 'ตรวจสอบย้อนกลับ',
                'cta_link_2' => '/trace',
                'sort_order' => 1,
            ],
            [
                'title' => 'ฤดูกาล 2026 · ผลสดจากแปลง',
                'subtitle' => 'คัดเกรด A ส่งตรงภายใน 24 ชม.',
                'eyebrow' => null,
                'body' => 'หมอนทอง มูซังคิง และสายพันธุ์พรีเมียม จากสวน AuraGold',
                'image_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=1920&q=80',
                'cta_label' => 'ร้านค้า',
                'cta_link' => '/products',
                'cta_label_2' => null,
                'cta_link_2' => null,
                'sort_order' => 2,
            ],
            [
                'title' => 'เยี่ยมชมสวน · สัมผัสทุเรียนจากต้น',
                'subtitle' => 'จองรอบทัวร์ได้แล้ววันนี้',
                'eyebrow' => null,
                'body' => 'เดินชมแปลง ชิมสดจากต้น และเรียนรู้การแปรรูป',
                'image_url' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476b?w=1920&q=80',
                'cta_label' => 'จองเยี่ยมชม',
                'cta_link' => '/tours',
                'cta_label_2' => null,
                'cta_link_2' => null,
                'sort_order' => 3,
            ],
        ];

        foreach ($slides as $slide) {
            HeroSlide::query()->updateOrCreate(
                ['title' => $slide['title'], 'sort_order' => $slide['sort_order']],
                [...$slide, 'is_active' => true],
            );
        }
    }
}
