<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Services\PackageEnrollmentService;
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

        /** @var array<string, array{title:string,title_en:string,description_ar:string,description_en:string,category:string,image_url:string,instructor:string}> $sourceData */
        $sourceData = require database_path('data/source_workshop_descriptions.php');

        // Never bulk-delete events: enrollments (and other rows) use event_id with
        // ON DELETE CASCADE, so deleting events wipes learners' "My workshops".
        // Upsert by slug so IDs stay stable across re-seeds.

        foreach ($pack['rows'] as [$slug, $title, $presenter, $date, $time, $featured]) {
            // Parse wall time in Kuwait, then store UTC so API ISO strings and frontend Asia/Kuwait formatting match.
            $starts = Carbon::parse($date.' '.$time, 'Asia/Kuwait')->utc();
            $ends = (clone $starts)->addHours(2);
            $titleEn = $titleEnBySlug[$slug] ?? $slug;

            $src = $sourceData[$slug] ?? null;

            // Use rich source data when available, fall back to generic templates.
            $descriptionAr = $src['description_ar'] ?? ('جلسة قصيرة وعملية في '.$title.' مع تطبيقات مباشرة عبر زوم.');
            $descriptionEn = $src['description_en'] ?? ('A short, practical session on '.$titleEn.' with live Zoom exercises.');
            $imageUrl = $src['image_url'] ?? $images[crc32($slug) % count($images)];
            $instructor = $src['instructor'] ?? $presenter;
            $category = $src['category'] ?? null;
            // Tag the category in summary so the frontend can read it back.
            $categoryTag = $category ? '['.$category.'] ' : '';
            $summaryAr = $categoryTag.'ورشة '.$title.' يقدمها '.$instructor.'.';
            $summaryEn = $categoryTag.$titleEn.' workshop led by '.$instructor.'.';

            Event::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'title_en' => $titleEn,
                    'summary' => $summaryAr,
                    'summary_en' => $summaryEn,
                    'description' => $descriptionAr,
                    'description_en' => $descriptionEn,
                    'image_url' => $imageUrl,
                    'starts_at' => $starts,
                    'ends_at' => $ends,
                    'location' => 'أونلاين عبر زوم',
                    'location_en' => 'Online via Zoom',
                    'price' => 10,
                    'currency' => 'KWD',
                    'capacity' => 240,
                    'is_featured' => $featured,
                    'is_published' => true,
                ],
            );
        }

        $allowedSlugs = collect($pack['rows'])->map(fn (array $row) => $row[0])
            ->merge(Event::ALL_PACKAGE_SLUGS)
            ->all();

        Event::query()->updateOrCreate(
            ['slug' => Event::SLUG_100_WORKSHOPS_PACKAGE],
            [
                'title' => 'باقة الـ 100 ورشة التدريبية',
                'title_en' => '100 Training Workshops Package',
                'summary' => 'باقة شاملة لطلاب جامعة الكويت بالتعاون مع شركة نكست لفل.',
                'summary_en' => 'Full bundle for Kuwait University students in partnership with Next Level.',
                'description' => 'تشمل الوصول إلى مكتبة ورش محددة وفق الشروط المعتمدة على المنصة.',
                'description_en' => 'Includes access to a defined workshop library under the platform terms.',
                'image_url' => $images[0] ?? null,
                'starts_at' => Carbon::parse('2026-04-26 09:00', 'Asia/Kuwait')->utc(),
                'ends_at' => Carbon::parse('2026-04-30 18:00', 'Asia/Kuwait')->utc(),
                'location' => 'أونلاين عبر المنصة',
                'location_en' => 'Online via platform',
                'price' => 100,
                'currency' => 'KWD',
                'capacity' => 500,
                'is_featured' => true,
                'is_published' => true,
            ],
        );

        // Build dynamic personal/professional workshop slug lists from source data.
        $personalSlugs = [];
        $professionalSlugs = [];
        foreach ($sourceData as $slug => $info) {
            if (($info['category'] ?? null) === 'personal') {
                $personalSlugs[] = $slug;
            } elseif (($info['category'] ?? null) === 'professional') {
                $professionalSlugs[] = $slug;
            }
        }

        // ── New 50-workshop category bundles (matching source design) ──
        $newBundles = [
            [
                'slug' => Event::SLUG_PACKAGE_PERSONAL_50,
                'title' => 'باقة مهارات الكفاءة الشخصية',
                'title_en' => 'Personal Competence Skills Bundle',
                'summary' => 'وصول كامل لـ 50 ورشة تدريبية في مهارات الكفاءة الشخصية مع شهادات معتمدة.',
                'summary_en' => 'Full access to 50 training workshops in Personal Competence Skills with certified certificates.',
                'price' => 50,
                'image_url' => $images[1] ?? null,
                'workshop_slugs' => $personalSlugs,
            ],
            [
                'slug' => Event::SLUG_PACKAGE_PROFESSIONAL_50,
                'title' => 'باقة الاستعداد المهني والتقني',
                'title_en' => 'Professional & Technical Readiness Bundle',
                'summary' => 'وصول كامل لـ 50 ورشة تدريبية في الاستعداد المهني والتقني مع شهادات معتمدة.',
                'summary_en' => 'Full access to 50 training workshops in Professional & Technical Readiness with certified certificates.',
                'price' => 50,
                'image_url' => $images[2] ?? null,
                'workshop_slugs' => $professionalSlugs,
            ],
        ];

        foreach ($newBundles as $cp) {
            Event::query()->updateOrCreate(
                ['slug' => $cp['slug']],
                [
                    'title' => $cp['title'],
                    'title_en' => $cp['title_en'],
                    'summary' => $cp['summary'],
                    'summary_en' => $cp['summary_en'],
                    'description' => $cp['summary'],
                    'description_en' => $cp['summary_en'],
                    'image_url' => $cp['image_url'],
                    'starts_at' => Carbon::parse('2026-04-26 09:00', 'Asia/Kuwait')->utc(),
                    'ends_at' => Carbon::parse('2026-04-30 18:00', 'Asia/Kuwait')->utc(),
                    'location' => 'أونلاين عبر المنصة',
                    'location_en' => 'Online via platform',
                    'price' => $cp['price'],
                    'currency' => 'KWD',
                    'capacity' => 500,
                    'is_featured' => true,
                    'is_published' => true,
                ],
            );
        }

        // ── Legacy hidden category bundles (kept for backward compat) ──
        $legacyCategoryPackages = require database_path('data/category_packages.php');
        foreach ($legacyCategoryPackages as $cp) {
            Event::query()->updateOrCreate(
                ['slug' => $cp['slug']],
                [
                    'title' => $cp['title'],
                    'title_en' => $cp['title_en'],
                    'summary' => $cp['summary'],
                    'summary_en' => $cp['summary_en'],
                    'description' => $cp['summary'],
                    'description_en' => $cp['summary_en'],
                    'image_url' => $images[crc32($cp['slug']) % count($images)],
                    'starts_at' => Carbon::parse('2026-04-26 09:00', 'Asia/Kuwait')->utc(),
                    'ends_at' => Carbon::parse('2026-04-30 18:00', 'Asia/Kuwait')->utc(),
                    'location' => 'أونلاين عبر المنصة',
                    'location_en' => 'Online via platform',
                    'price' => $cp['price'],
                    'currency' => 'KWD',
                    'capacity' => 500,
                    'is_featured' => false,
                    'is_published' => false, // hidden from public listing
                ],
            );
        }

        Event::query()
            ->whereNotIn('slug', $allowedSlugs)
            ->whereDoesntHave('enrollments')
            ->delete();

        // Sync enrollments for every known package. The service reads the
        // underlying workshop list from the same source files the seeder uses.
        $service = app(PackageEnrollmentService::class);
        foreach (Event::ALL_PACKAGE_SLUGS as $packageSlug) {
            $service->sync($packageSlug);
        }
    }
}
