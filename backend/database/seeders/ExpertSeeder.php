<?php

namespace Database\Seeders;

use App\Models\Expert;
use Illuminate\Database\Seeder;

class ExpertSeeder extends Seeder
{
    public function run(): void
    {
        $experts = [
            ['name' => 'Dr. Sara Al-Mutairi', 'email' => 'sara.mutairi@example.com', 'phone' => '+965 9900 1234', 'specialization' => 'Leadership', 'title' => 'Leadership Coach', 'bio' => 'Over 15 years of experience in executive coaching and organizational development across the GCC region.'],
            ['name' => 'Ahmad Al-Fahad', 'email' => 'ahmad.fahad@example.com', 'phone' => '+965 9900 2345', 'specialization' => 'Technology', 'title' => 'Senior Software Engineer', 'bio' => 'Full-stack developer specializing in cloud architecture and AI-driven solutions. Google Developer Expert.'],
            ['name' => 'Fatima Al-Rashidi', 'email' => 'fatima.rashidi@example.com', 'phone' => '+965 9900 3456', 'specialization' => 'Education', 'title' => 'Education Consultant', 'bio' => 'Passionate about innovative teaching methods and curriculum development for youth empowerment.'],
            ['name' => 'Khaled Bouresli', 'email' => 'khaled.bouresli@example.com', 'phone' => '+965 9900 4567', 'specialization' => 'Business', 'title' => 'Startup Mentor', 'bio' => 'Serial entrepreneur and angel investor. Founded 3 successful startups in Kuwait and Bahrain.'],
            ['name' => 'Nour Al-Sabah', 'email' => 'nour.sabah@example.com', 'phone' => '+965 9900 5678', 'specialization' => 'Communication', 'title' => 'Public Speaking Trainer', 'bio' => 'TEDx speaker and communication skills trainer. Helped over 500 professionals improve their presentation skills.'],
            ['name' => 'Dr. Yousef Al-Kandari', 'email' => 'yousef.kandari@example.com', 'phone' => '+965 9900 6789', 'specialization' => 'Health', 'title' => 'Wellness Coach', 'bio' => 'Certified health coach focused on stress management and mental well-being in the workplace.'],
            ['name' => 'Mariam Al-Enezi', 'email' => 'mariam.enezi@example.com', 'phone' => '+965 9900 7890', 'specialization' => 'Arts', 'title' => 'Creative Director', 'bio' => 'Award-winning designer and visual arts instructor with a passion for empowering young creatives.'],
            ['name' => 'Bader Al-Ajmi', 'email' => 'bader.ajmi@example.com', 'phone' => '+965 9900 8901', 'specialization' => 'Technology', 'title' => 'Cybersecurity Expert', 'bio' => 'CISSP-certified professional with 10+ years in information security consulting for government and enterprise.'],
            ['name' => 'Dalal Al-Shammari', 'email' => 'dalal.shammari@example.com', 'phone' => '+965 9900 9012', 'specialization' => 'Leadership', 'title' => 'HR Director', 'bio' => 'Human resources leader specializing in talent development and organizational culture transformation.'],
            ['name' => 'Hassan Al-Otaibi', 'email' => 'hassan.otaibi@example.com', 'phone' => '+965 9900 0123', 'specialization' => 'Business', 'title' => 'Financial Consultant', 'bio' => 'CFA charterholder providing financial literacy workshops for youth and aspiring entrepreneurs.', 'is_active' => false],
        ];

        foreach ($experts as $data) {
            Expert::query()->firstOrCreate(
                ['email' => $data['email']],
                $data
            );
        }
    }
}
