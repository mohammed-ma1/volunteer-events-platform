<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        /** @var array{images: string[], rows: array<int, array{0: string, 1: string, 2: string, 3: string, 4: string, 5: bool}>, title_en_by_slug: array<string, string>} $pack */
        $pack = require database_path('data/ku_student_week_workshops.php');
        $images = $pack['images'];
        $titleEnBySlug = $pack['title_en_by_slug'];

        // Never bulk-delete events: enrollments (and other rows) use event_id with
        // ON DELETE CASCADE, so deleting events wipes learners' "My workshops".
        // Upsert by slug so IDs stay stable across re-seeds.

        foreach ($pack['rows'] as [$slug, $title, $presenter, $date, $time, $featured]) {
            // Parse wall time in Kuwait, then store UTC so API ISO strings and frontend Asia/Kuwait formatting match.
            $starts = Carbon::parse($date.' '.$time, 'Asia/Kuwait')->utc();
            $ends = (clone $starts)->addHours(2);
            $img = $images[crc32($slug) % count($images)];
            $titleEn = $titleEnBySlug[$slug] ?? $slug;
            $summaryAr = 'ورشة '.$title.' يقدمها '.$presenter.'.';
            $summaryEn = $titleEn.' workshop led by '.$presenter.'.';
            $descriptionAr = 'جلسة قصيرة وعملية في '.$title.' مع تطبيقات مباشرة عبر زوم.';
            $descriptionEn = 'A short, practical session on '.$titleEn.' with live Zoom exercises.';

            Event::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'title_en' => $titleEn,
                    'summary' => $summaryAr,
                    'summary_en' => $summaryEn,
                    'description' => $descriptionAr,
                    'description_en' => $descriptionEn,
                    'image_url' => $img,
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

        $categoryPackages = require database_path('data/category_packages.php');
        foreach ($categoryPackages as $cp) {
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
                    'is_published' => true,
                ],
            );
        }

        Event::query()
            ->whereNotIn('slug', $allowedSlugs)
            ->whereDoesntHave('enrollments')
            ->delete();

        $this->enrollPaidUsersInAllScheduleWorkshops($pack);
        $this->enrollPaidUsersInCategoryPackages($categoryPackages);
    }

    /**
     * Backfill enrollments for the 100-workshops mega-bundle.
     */
    private function enrollPaidUsersInAllScheduleWorkshops(array $pack): void
    {
        $workshopSlugs = collect($pack['rows'])->map(fn (array $row) => $row[0])->all();
        $workshopIds = Event::query()->whereIn('slug', $workshopSlugs)->orderBy('id')->pluck('id');

        if ($workshopIds->isEmpty()) {
            return;
        }

        $packageEventId = Event::query()->where('slug', Event::SLUG_100_WORKSHOPS_PACKAGE)->value('id');
        if ($packageEventId === null) {
            return;
        }

        $this->bulkEnrollPackageBuyers($packageEventId, $workshopIds);
    }

    /**
     * Backfill enrollments for each category package.
     */
    private function enrollPaidUsersInCategoryPackages(array $categoryPackages): void
    {
        foreach ($categoryPackages as $cp) {
            $packageEventId = Event::query()->where('slug', $cp['slug'])->value('id');
            if ($packageEventId === null) {
                continue;
            }

            $workshopIds = Event::query()->whereIn('slug', $cp['workshop_slugs'])->orderBy('id')->pluck('id');
            if ($workshopIds->isEmpty()) {
                continue;
            }

            $this->bulkEnrollPackageBuyers($packageEventId, $workshopIds);
        }
    }

    /**
     * For a given package event ID, find all paid buyers and enroll them
     * in the given workshop IDs. Idempotent via insertOrIgnore.
     */
    private function bulkEnrollPackageBuyers(int $packageEventId, $workshopIds): void
    {
        $emails = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereHas('items', fn ($q) => $q->where('event_id', $packageEventId))
            ->distinct()
            ->pluck('email')
            ->filter(fn ($email) => is_string($email) && $email !== '');

        if ($emails->isEmpty()) {
            return;
        }

        $userIds = User::query()->whereIn('email', $emails)->pluck('id');
        if ($userIds->isEmpty()) {
            return;
        }

        $now = now();
        $rows = [];
        foreach ($userIds as $userId) {
            foreach ($workshopIds as $eventId) {
                $rows[] = [
                    'user_id' => $userId,
                    'event_id' => $eventId,
                    'enrolled_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('enrollments')->insertOrIgnore($chunk);
        }
    }
}
