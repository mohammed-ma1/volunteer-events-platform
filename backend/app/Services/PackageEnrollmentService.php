<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Handles the "when someone buys a package, enroll them into all underlying
 * workshops" logic. Used by the EventSeeder (to backfill) and by the admin
 * `POST /admin/packages/{slug}/sync-enrollments` endpoint (to re-sync).
 */
class PackageEnrollmentService
{
    /**
     * Sync enrollments for every paid buyer of the given package slug.
     *
     * @return array{users:int, workshops:int, new_enrollments:int}
     */
    public function sync(string $packageSlug): array
    {
        if (! in_array($packageSlug, Event::ALL_PACKAGE_SLUGS, true)) {
            throw new \InvalidArgumentException("'$packageSlug' is not a known package slug.");
        }

        $packageEvent = Event::query()->where('slug', $packageSlug)->first();
        if (! $packageEvent) {
            return ['users' => 0, 'workshops' => 0, 'new_enrollments' => 0];
        }

        $workshopIds = $this->workshopIdsForPackage($packageSlug);
        if ($workshopIds->isEmpty()) {
            return ['users' => 0, 'workshops' => 0, 'new_enrollments' => 0];
        }

        $userIds = $this->paidBuyerUserIds($packageEvent->id);
        if ($userIds->isEmpty()) {
            return ['users' => 0, 'workshops' => $workshopIds->count(), 'new_enrollments' => 0];
        }

        $inserted = $this->bulkEnroll($userIds, $workshopIds);

        return [
            'users' => $userIds->count(),
            'workshops' => $workshopIds->count(),
            'new_enrollments' => $inserted,
        ];
    }

    /**
     * Event IDs whose slugs make up the underlying workshops for $packageSlug.
     */
    public function workshopIdsForPackage(string $packageSlug): Collection
    {
        $workshopSlugs = $this->workshopSlugsForPackage($packageSlug);
        if (empty($workshopSlugs)) {
            return collect();
        }

        return Event::query()
            ->whereIn('slug', $workshopSlugs)
            ->orderBy('id')
            ->pluck('id');
    }

    /**
     * The list of workshop slugs underlying a package. Mirrors the mapping
     * the seeders use, then unions with any admin-added events that match
     * the same criteria so workshops created via the admin portal are
     * automatically included in the bundle.
     *
     *   - 100-bundle: seeded KU week workshops + every non-package event in DB.
     *   - personal/professional 50-bundles: source-data entries tagged with the
     *     matching category + DB events whose Arabic summary begins with
     *     `[personal]` / `[professional]` (the same tag the admin form writes).
     *   - Legacy packages: explicit static list only (frozen).
     *
     * @return string[]
     */
    public function workshopSlugsForPackage(string $packageSlug): array
    {
        if ($packageSlug === Event::SLUG_100_WORKSHOPS_PACKAGE) {
            $pack = require database_path('data/ku_student_week_workshops.php');
            $seeded = collect($pack['rows'])->map(fn (array $row) => $row[0])->all();
            $dbAdded = Event::query()
                ->whereNotIn('slug', Event::ALL_PACKAGE_SLUGS)
                ->pluck('slug')
                ->all();
            return array_values(array_unique(array_merge($seeded, $dbAdded)));
        }

        if ($packageSlug === Event::SLUG_PACKAGE_PERSONAL_50 || $packageSlug === Event::SLUG_PACKAGE_PROFESSIONAL_50) {
            /** @var array<string, array{category?:string}> $sourceData */
            $sourceData = require database_path('data/source_workshop_descriptions.php');
            $wanted = $packageSlug === Event::SLUG_PACKAGE_PERSONAL_50 ? 'personal' : 'professional';
            $slugs = [];
            foreach ($sourceData as $slug => $info) {
                if (($info['category'] ?? null) === $wanted) {
                    $slugs[] = $slug;
                }
            }
            $tag = $wanted === 'personal' ? '[personal]' : '[professional]';
            $dbAdded = Event::query()
                ->whereNotIn('slug', Event::ALL_PACKAGE_SLUGS)
                ->where('summary', 'like', $tag.'%')
                ->pluck('slug')
                ->all();
            return array_values(array_unique(array_merge($slugs, $dbAdded)));
        }

        // Legacy packages are fully described in a static data file.
        $legacyCategoryPackages = require database_path('data/category_packages.php');
        foreach ($legacyCategoryPackages as $cp) {
            if (($cp['slug'] ?? null) === $packageSlug) {
                return $cp['workshop_slugs'] ?? [];
            }
        }

        return [];
    }

    /**
     * User IDs who have a paid order containing the given package event ID.
     */
    private function paidBuyerUserIds(int $packageEventId): Collection
    {
        $emails = Order::query()
            ->where('status', Order::STATUS_PAID)
            ->whereHas('items', fn ($q) => $q->where('event_id', $packageEventId))
            ->distinct()
            ->pluck('email')
            ->filter(fn ($email) => is_string($email) && $email !== '');

        if ($emails->isEmpty()) {
            return collect();
        }

        return User::query()->whereIn('email', $emails)->pluck('id');
    }

    /**
     * Insert missing enrollments in chunks. Returns the number of newly-created rows.
     */
    private function bulkEnroll(Collection $userIds, Collection $workshopIds): int
    {
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

        $inserted = 0;
        foreach (array_chunk($rows, 500) as $chunk) {
            $inserted += DB::table('enrollments')->insertOrIgnore($chunk);
        }

        return $inserted;
    }
}
