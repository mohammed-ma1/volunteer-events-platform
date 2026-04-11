<?php

namespace Database\Seeders;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        /** @var array{images: string[], rows: array<int, array{0: string, 1: string, 2: string, 3: string, 4: string, 5: bool}>} $pack */
        $pack = require database_path('data/ku_student_week_workshops.php');
        $images = $pack['images'];

        Event::query()->delete();

        foreach ($pack['rows'] as [$slug, $title, $presenter, $date, $time, $featured]) {
            $starts = Carbon::parse($date.' '.$time, 'Asia/Kuwait');
            $ends = (clone $starts)->addHours(2);
            $img = $images[crc32($slug) % count($images)];

            Event::query()->create([
                'slug' => $slug,
                'title' => $title,
                'summary' => 'مقدم الورشة: '.$presenter.' · أونلاين عبر زوم · 5 د.ك',
                'description' => 'ورشة ضمن أسبوع تدريبي لطلاب جامعة الكويت بالتعاون مع شركة نكست لفل. الجلسات مباشرة في الموعد المحدد، مع تسجيل يتيح المشاهدة لاحقاً عبر المنصة التعليمية.'."\n\n"
                    .'مقدم الورشة: '.$presenter."\n\n"
                    .'النمط: أونلاين عبر زوم'."\n\n"
                    .'جدول المحتوى مستند إلى المعاينة العامة لمنصة Media Solution.',
                'image_url' => $img,
                'starts_at' => $starts,
                'ends_at' => $ends,
                'location' => 'أونلاين عبر زوم',
                'price' => 5,
                'currency' => 'KWD',
                'capacity' => 240,
                'is_featured' => $featured,
                'is_published' => true,
            ]);
        }
    }
}
