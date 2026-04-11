<?php

namespace Database\Seeders;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        /** @var array{images: string[], rows: array<int, array{0: string, 1: string, 2: string, 3: string, 4: string, 5: bool}>, title_en_by_slug: array<string, string>} $pack */
        $pack = require database_path('data/ku_student_week_workshops.php');
        $images = $pack['images'];
        $titleEnBySlug = $pack['title_en_by_slug'];

        Event::query()->delete();

        foreach ($pack['rows'] as [$slug, $title, $presenter, $date, $time, $featured]) {
            $starts = Carbon::parse($date.' '.$time, 'Asia/Kuwait');
            $ends = (clone $starts)->addHours(2);
            $img = $images[crc32($slug) % count($images)];
            $titleEn = $titleEnBySlug[$slug] ?? $slug;
            $summaryEn = 'Facilitator: '.$presenter.' · Online via Zoom · 5 KWD';

            Event::query()->create([
                'slug' => $slug,
                'title' => $title,
                'title_en' => $titleEn,
                'summary' => 'مقدم الورشة: '.$presenter.' · أونلاين عبر زوم · 5 د.ك',
                'summary_en' => $summaryEn,
                'description' => 'ورشة ضمن أسبوع تدريبي لطلاب جامعة الكويت بالتعاون مع شركة نكست لفل. الجلسات مباشرة في الموعد المحدد، مع تسجيل يتيح المشاهدة لاحقاً عبر المنصة التعليمية.'."\n\n"
                    .'مقدم الورشة: '.$presenter."\n\n"
                    .'النمط: أونلاين عبر زوم'."\n\n"
                    .'جدول المحتوى مستند إلى المعاينة العامة لمنصة Media Solution.',
                'image_url' => $img,
                'starts_at' => $starts,
                'ends_at' => $ends,
                'location' => 'أونلاين عبر زوم',
                'location_en' => 'Online via Zoom',
                'price' => 5,
                'currency' => 'KWD',
                'capacity' => 240,
                'is_featured' => $featured,
                'is_published' => true,
            ]);
        }

        Event::query()->create([
            'slug' => 'package-100-workshops',
            'title' => 'باقة الـ 100 ورشة التدريبية',
            'title_en' => '100 Training Workshops Package',
            'summary' => 'باقة شاملة لطلاب جامعة الكويت بالتعاون مع شركة نكست لفل.',
            'summary_en' => 'Full bundle for Kuwait University students in partnership with Next Level.',
            'description' => 'تشمل الوصول إلى مكتبة ورش محددة وفق الشروط المعتمدة على المنصة.',
            'image_url' => $images[0] ?? null,
            'starts_at' => Carbon::parse('2026-04-26 09:00', 'Asia/Kuwait'),
            'ends_at' => Carbon::parse('2026-04-30 18:00', 'Asia/Kuwait'),
            'location' => 'أونلاين عبر المنصة',
            'location_en' => 'Online via platform',
            'price' => 50,
            'currency' => 'KWD',
            'capacity' => 500,
            'is_featured' => true,
            'is_published' => true,
        ]);
    }
}
