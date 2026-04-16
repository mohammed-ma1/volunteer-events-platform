<?php

namespace Database\Seeders;

use App\Models\Expert;
use Illuminate\Database\Seeder;

class ExpertSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/ku_student_week_facilitators.json');
        $rows = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        $bg = ['001a33', '0c4a6e', '164e63', '1e3a5f', '312e81', '3730a3', '4c1d95', '831843'];
        $avatar = static function (string $name, int $i) use ($bg): string {
            $hex = $bg[$i % count($bg)];

            return 'https://ui-avatars.com/api/?'.http_build_query([
                'name' => $name,
                'size' => 512,
                'background' => $hex,
                'color' => 'ffffff',
                'bold' => 'true',
                'format' => 'png',
            ]);
        };

        foreach ($rows as $i => $row) {
            $name = $row['name_ar'];
            $phone = $row['phone'] ?? null;
            $digits = $phone ? preg_replace('/\D/', '', (string) $phone) : '';
            $email = $digits !== ''
                ? 'facilitator.'.$digits.'@ku-workshops.local'
                : 'facilitator.'.substr(hash('sha256', $name), 0, 20).'@ku-workshops.local';

            $onPlatform = $row['on_platform'] ?? null;
            $isActive = $onPlatform !== false;

            Expert::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => $phone,
                    'specialization' => 'KU workshop week',
                    'title' => 'Workshop facilitator',
                    'bio' => 'Facilitator for Kuwait University student training week (April 2026).',
                    'avatar_url' => $avatar($name, $i),
                    'is_active' => $isActive,
                ]
            );
        }
    }
}
