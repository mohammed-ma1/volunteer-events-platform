<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@volunteer-events.com'],
            [
                'name' => 'Admin',
                'password' => 'admin123!',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
