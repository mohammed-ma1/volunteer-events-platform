<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $cities = ['Dubai', 'Riyadh', 'Kuwait City', 'Doha', 'Manama', 'Amman', 'Cairo', 'Beirut'];
        $themes = [
            'Community Garden Day',
            'Youth Mentorship Kickoff',
            'Coastal Cleanup',
            'Food Bank Sorting',
            'Coding for Good Workshop',
            'Neighborhood Health Fair',
            'Animal Shelter Helpers',
            'Literacy Tutoring Sprint',
            'Green Run Marshalling',
            'Refugee Welcome Drive',
        ];

        $prices = [0, 5, 10, 15, 25, 40];

        for ($i = 1; $i <= 100; $i++) {
            $theme = $themes[array_rand($themes)];
            $city = $cities[array_rand($cities)];
            $title = $theme.' — '.$city.' #'.$i;
            $slug = Str::slug($title).'-'.$i;
            $starts = now()->addDays(random_int(5, 200))->setHour(10)->setMinute(0)->setSecond(0);
            $featured = $i <= 8 || $i % 17 === 0;

            Event::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'summary' => 'Join fellow volunteers for a high-impact session with onboarding, clear roles, and refreshments.',
                    'description' => "We're bringing people together for a focused volunteer block. You'll get a short briefing, assigned tasks, and a friendly team lead. Comfortable clothing recommended.",
                    'image_url' => 'https://picsum.photos/seed/ve-'.$i.'/800/520',
                    'starts_at' => $starts,
                    'ends_at' => (clone $starts)->addHours(4),
                    'location' => $city.' Community Hub',
                    'price' => $prices[array_rand($prices)],
                    'currency' => 'KWD',
                    'capacity' => random_int(20, 250),
                    'is_featured' => $featured,
                    'is_published' => true,
                ]
            );
        }
    }
}
