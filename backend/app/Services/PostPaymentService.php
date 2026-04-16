<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Event;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PostPaymentService
{
    /**
     * After an order is paid, find or create a user account and enroll them in all purchased events.
     *
     * @return array{user: User, password: string|null, is_new: bool}
     */
    public function handlePaidOrder(Order $order): array
    {
        $order->load(['items.event']);

        $existingUser = User::where('email', $order->email)->first();
        $isNew = $existingUser === null;
        $password = null;

        if ($isNew) {
            $password = Str::random(10);

            $user = User::create([
                'name' => $order->customer_name,
                'email' => $order->email,
                'password' => $password,
                'role' => 'user',
                'phone' => $order->phone,
                'is_active' => true,
            ]);

            Log::info('Auto-created user from paid order', [
                'user_id' => $user->id,
                'email' => $user->email,
                'order_uuid' => $order->uuid,
            ]);
        } else {
            $user = $existingUser;
        }

        $enrolledCount = 0;
        $purchased100Package = false;
        $purchasedCategoryPackageSlugs = [];

        foreach ($order->items as $item) {
            if (! $item->event_id || ! $item->event) {
                continue;
            }

            $slug = $item->event->slug;

            if ($slug === Event::SLUG_100_WORKSHOPS_PACKAGE) {
                $purchased100Package = true;

                continue;
            }

            if (in_array($slug, Event::CATEGORY_PACKAGE_SLUGS, true)) {
                $purchasedCategoryPackageSlugs[] = $slug;

                continue;
            }

            if ($this->enrollUserOnce($user->id, $item->event_id)) {
                $enrolledCount++;
            }
        }

        if ($purchased100Package) {
            foreach ($this->kuScheduleWorkshopEventIds() as $eventId) {
                if ($this->enrollUserOnce($user->id, $eventId)) {
                    $enrolledCount++;
                }
            }
        }

        if (! empty($purchasedCategoryPackageSlugs)) {
            $enrolledCount += $this->enrollCategoryPackageWorkshops($user->id, $purchasedCategoryPackageSlugs);
        }

        Log::info('Post-payment enrollment', [
            'user_id' => $user->id,
            'order_uuid' => $order->uuid,
            'events_enrolled' => $enrolledCount,
            'is_new_user' => $isNew,
        ]);

        return [
            'user' => $user,
            'password' => $password,
            'is_new' => $isNew,
        ];
    }

    private function enrollUserOnce(int $userId, int $eventId): bool
    {
        $enrollment = Enrollment::firstOrCreate(
            ['user_id' => $userId, 'event_id' => $eventId],
            ['enrolled_at' => now()]
        );

        return $enrollment->wasRecentlyCreated;
    }

    private function enrollCategoryPackageWorkshops(int $userId, array $packageSlugs): int
    {
        /** @var array<int, array{slug: string, workshop_slugs: string[]}> $categoryPackages */
        $categoryPackages = require database_path('data/category_packages.php');
        $slugMap = collect($categoryPackages)->keyBy('slug');

        $workshopSlugs = [];
        foreach ($packageSlugs as $ps) {
            $cp = $slugMap->get($ps);
            if ($cp) {
                $workshopSlugs = array_merge($workshopSlugs, $cp['workshop_slugs']);
            }
        }

        if (empty($workshopSlugs)) {
            return 0;
        }

        $workshopIds = Event::query()
            ->whereIn('slug', array_unique($workshopSlugs))
            ->orderBy('id')
            ->pluck('id');

        $count = 0;
        foreach ($workshopIds as $eventId) {
            if ($this->enrollUserOnce($userId, $eventId)) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * @return Collection<int, int>
     */
    private function kuScheduleWorkshopEventIds(): Collection
    {
        /** @var array{rows: array<int, array{0: string}>} $pack */
        $pack = require database_path('data/ku_student_week_workshops.php');
        $slugs = collect($pack['rows'])->map(fn (array $row) => $row[0])->all();

        return Event::query()
            ->whereIn('slug', $slugs)
            ->orderBy('id')
            ->pluck('id');
    }
}
