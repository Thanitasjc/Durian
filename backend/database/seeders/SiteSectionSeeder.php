<?php

namespace Database\Seeders;

use App\Models\SiteSection;
use Illuminate\Database\Seeder;

class SiteSectionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            [
                'key' => 'hero',
                'title' => 'มาตรฐานทองคำแห่งทุเรียน',
                'eyebrow' => 'ก่อตั้งปี 1984 · ฤดูกาล 2026',
                'subtitle' => 'จากสวนสู่โต๊ะอาหาร',
                'body' => 'ปลูก เก็บเกี่ยว แปรรูป และจัดส่งด้วยระบบ LOT / Batch ตรวจสอบย้อนกลับได้ทุกขั้นตอน',
                'image_url' => 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=1920&q=80',
                'cta_label' => 'ดูสินค้าฤดูกาลนี้',
                'cta_link' => '/products',
                'cta_label_2' => 'ตรวจสอบย้อนกลับ',
                'cta_link_2' => '/trace',
                'meta' => [
                    'slides' => [
                        [
                            'title' => 'มาตรฐานทองคำแห่งทุเรียน',
                            'subtitle' => 'จากสวนสู่โต๊ะอาหาร',
                            'body' => 'ปลูก เก็บเกี่ยว แปรรูป และจัดส่งด้วยระบบ LOT / Batch ตรวจสอบย้อนกลับได้ทุกขั้นตอน',
                            'eyebrow' => 'ก่อตั้งปี 1984 · ฤดูกาล 2026',
                            'image_url' => 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=1920&q=80',
                            'cta_label' => 'ดูสินค้าฤดูกาลนี้',
                            'cta_link' => '/products',
                            'cta_label_2' => 'ตรวจสอบย้อนกลับ',
                            'cta_link_2' => '/trace',
                        ],
                        [
                            'title' => 'ฤดูกาล 2026 · ผลสดจากแปลง',
                            'subtitle' => 'คัดเกรด A ส่งตรงภายใน 24 ชม.',
                            'body' => 'หมอนทอง มูซังคิง และสายพันธุ์พรีเมียม จากสวน AuraGold',
                            'image_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=1920&q=80',
                            'cta_label' => 'ร้านค้า',
                            'cta_link' => '/products',
                        ],
                        [
                            'title' => 'เยี่ยมชมสวน · สัมผัสทุเรียนจากต้น',
                            'subtitle' => 'จองรอบทัวร์ได้แล้ววันนี้',
                            'body' => 'เดินชมแปลง ชิมสดจากต้น และเรียนรู้การแปรรูป',
                            'image_url' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476b?w=1920&q=80',
                            'cta_label' => 'จองเยี่ยมชม',
                            'cta_link' => '/tours',
                        ],
                    ],
                ],
                'sort_order' => 1,
            ],
            [
                'key' => 'story',
                'title' => 'สดจากต้น ส่งตรงถึงคุณ',
                'eyebrow' => 'เรื่องราวของสวน',
                'subtitle' => null,
                'body' => 'เราไม่เก็บเกี่ยวก่อนกำหนด ทุกล็อตบันทึกแปลง วันที่ และทีมงาน เพื่อความโปร่งใสและความปลอดภัยด้านอาหาร',
                'image_url' => 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800&q=80',
                'meta' => [
                    'stats' => [
                        ['value' => '100%', 'label' => 'ตกธรรมชาติ'],
                        ['value' => '24 ชม.', 'label' => 'จากสวนถึงคลัง'],
                    ],
                ],
                'sort_order' => 2,
            ],
            [
                'key' => 'sustainability',
                'title' => 'ความมุ่งมั่นต่อสิ่งแวดล้อม',
                'eyebrow' => 'Agriculture',
                'body' => 'เกษตรเชิงฟื้นฟู ปุ๋ยอินทรีย์จากเปลือกทุเรียน และระบบรดน้ำประหยัด',
                'meta' => [
                    'cards' => [
                        ['title' => 'ดินสุขภาพดี', 'desc' => 'คืนเปลือกทุเรียนเป็นปุ๋ยหมักกลับสู่แปลง'],
                        ['title' => 'รดน้ำอัจฉริยะ', 'desc' => 'ลดการใช้น้ำด้วยเซ็นเซอร์ความชื้น'],
                        ['title' => 'มาตรฐาน GAP', 'desc' => 'ปฏิบัติตามแนวทางเกษตรดี'],
                    ],
                ],
                'sort_order' => 3,
            ],
            [
                'key' => 'hot_products',
                'title' => "Today’s new hottest products\navailable now",
                'eyebrow' => 'Checkout New Products',
                'body' => 'สินค้าร้อนแรงจากสวนและโรงแปรรูป AuraGold',
                'cta_label' => 'ดูทั้งหมด',
                'cta_link' => '/products',
                'sort_order' => 4,
            ],
            [
                'key' => 'products',
                'title' => 'สินค้าแนะนำ',
                'eyebrow' => 'คอลเลกชัน',
                'body' => 'ทุเรียนสด เนื้อสด แช่แข็ง และอบแห้ง จากสวน AuraGold',
                'cta_label' => 'ดูทั้งหมด',
                'cta_link' => '/products',
                'sort_order' => 5,
            ],
            [
                'key' => 'tours',
                'title' => 'เยี่ยมชมสวน',
                'eyebrow' => 'Experience',
                'body' => 'เดินชมสวน เรียนรู้การปลูกและการแปรรูป ชิมทุเรียนสดจากต้น ภายใต้ร่มเงาต้นทุเรียนอายุหลายสิบปี',
                'cta_label' => 'จองรอบเยี่ยมชม',
                'cta_link' => '/contact',
                'meta' => [
                    'bullets' => [
                        'เดินชมแปลงและระบบรดน้ำ',
                        'ชิมหลายสายพันธุ์',
                        'อาหารกลางวันแนว farm-to-table',
                    ],
                ],
                'sort_order' => 6,
            ],
            [
                'key' => 'trace',
                'title' => 'ตรวจสอบย้อนกลับได้ทุก LOT',
                'eyebrow' => 'Traceability',
                'body' => 'ค้นหาด้วยรหัส LOT หรือ Batch เพื่อดูเส้นทางจากสวนถึงสินค้าสำเร็จรูป',
                'cta_label' => 'เริ่มตรวจสอบ',
                'cta_link' => '/trace',
                'sort_order' => 7,
            ],
        ];

        foreach ($sections as $section) {
            SiteSection::query()->updateOrCreate(
                ['key' => $section['key']],
                $section + ['is_active' => true]
            );
        }
    }
}
