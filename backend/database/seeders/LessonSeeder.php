<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\Event;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    public function run(): void
    {
        $events = Event::query()->take(5)->get();

        $sampleVideos = [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        ];

        $lessonTemplates = [
            ['title' => 'مقدمة', 'title_en' => 'Introduction', 'description' => 'Welcome to the workshop and overview of what you will learn.', 'duration' => 180],
            ['title' => 'المفاهيم الأساسية', 'title_en' => 'Core Concepts', 'description' => 'Understanding the fundamental principles and key ideas.', 'duration' => 420],
            ['title' => 'تطبيق عملي', 'title_en' => 'Practical Application', 'description' => 'Hands-on exercises and real-world examples.', 'duration' => 600],
            ['title' => 'تقنيات متقدمة', 'title_en' => 'Advanced Techniques', 'description' => 'Going deeper into advanced strategies and methods.', 'duration' => 540],
            ['title' => 'ملخص وخطوات تالية', 'title_en' => 'Summary & Next Steps', 'description' => 'Recap of key takeaways and how to continue your learning journey.', 'duration' => 300],
        ];

        $videoIndex = 0;

        foreach ($events as $event) {
            foreach ($lessonTemplates as $i => $template) {
                Lesson::query()->firstOrCreate(
                    ['event_id' => $event->id, 'sort_order' => $i],
                    [
                        'title' => $template['title'],
                        'title_en' => $template['title_en'],
                        'description' => $template['description'],
                        'video_url' => $sampleVideos[$videoIndex % count($sampleVideos)],
                        'duration_seconds' => $template['duration'],
                        'sort_order' => $i,
                        'is_preview' => $i === 0,
                    ]
                );
                $videoIndex++;
            }
        }

        $learner = User::query()->firstOrCreate(
            ['email' => 'learner@example.com'],
            [
                'name' => 'Test Learner',
                'password' => 'password123',
                'role' => 'user',
                'is_active' => true,
            ]
        );

        foreach ($events->take(3) as $event) {
            Enrollment::query()->firstOrCreate(
                ['user_id' => $learner->id, 'event_id' => $event->id],
                ['enrolled_at' => now()]
            );
        }
    }
}
