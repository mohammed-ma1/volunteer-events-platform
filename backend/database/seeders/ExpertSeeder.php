<?php

namespace Database\Seeders;

use App\Models\Expert;
use Illuminate\Database\Seeder;

class ExpertSeeder extends Seeder
{
    /**
     * Cloudflare R2 avatars for the 12 trainers we have studio photos of.
     * Keys are matched against the canonicalised Arabic name (alif/ya/diacritics
     * collapsed) so spelling variants between the facilitators JSON and the
     * source-trainer list both resolve.
     */
    private const R2_BASE = 'https://pub-b242a57539404e6c9709cad496bd5b5b.r2.dev';

    private const R2_AVATAR_OVERRIDES = [
        // Originally provided portraits.
        'منيرة النخيلان' => 'moneera.jpg',
        'زينب الغضبان' => 'zainab.jpg',
        'علي الانصاري' => 'ali.jpg',
        'مرزوق السعيد' => 'marzooq.jpg',
        'فاطمة عباس' => 'fatema.jpg',
        'غدير الكندري' => 'ghadeer.jpg',
        'د. جواد ابو الحسن' => 'jawaad.jpg',
        'شهد العطار' => 'shahad.jpg',
        'عبدالرحمن حماد' => 'abd-alrhahman.jpg',
        'هيا بوراشد' => 'hia.jpg',
        'هاجر النصار' => 'hajr.jpg',
        'عبدالعزيز الضبيب' => 'abd-alazeez.jpg',
        // Local presenter photos uploaded to R2 with the same filename.
        'د. بسام الجزاف' => 'bassam-al-jazzaf.jpg',
        'بدر الفيلكاوي' => 'badr-al-failakawi.jpg',
        'حسن سيد' => 'hassan-syed.jpg',
        'احمد سمير' => 'ahmed-sameer.jpg',
        'دلال النخيلان' => 'dalal-al-nakhelan.jpg',
        'سليمان المراغي' => 'sulaiman-al-maraghi.jpg',
        'المحامي ابراهيم السماعيل' => 'ibrahim-al-samael.jpg',
        'عبدالرحمن التركيت' => 'abdulrahman-al-turkait.jpg',
        'الاء النصار' => 'alaa-al-nassar.jpg',
        'عبدالرحمن خاجه' => 'abdulrahman-khajah.jpg',
        'د. محمد اسماعيل' => 'mohammed-ismail.jpg',
        'دانا العوضي' => 'dana-al-awadi.jpg',
        'شيماء الطباخ' => 'shaimaa-al-tabbakh.jpg',
        'محمد الجيماز' => 'mohammed-al-jaimaz.jpg',
        'ا. محمد الجيماز' => 'mohammed-al-jaimaz.jpg', // honorific prefix in the JSON
        'ابرار اشكناني' => 'abrar-ashkanani.jpg',
        'سارة المنيس' => 'sarah-al-munais.jpg',
        'فاطمة القطان' => 'fatima-al-qattan.jpg',
        'فيصل الدويسان' => 'faisal-al-duwaisan.jpg',
        'م. الجازي العجمي' => 'aljazzi.jpg',
    ];

    public function run(): void
    {
        $path = database_path('data/ku_student_week_facilitators.json');
        $rows = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        $bg = ['001a33', '0c4a6e', '164e63', '1e3a5f', '312e81', '3730a3', '4c1d95', '831843'];
        $placeholder = static function (string $name, int $i) use ($bg): string {
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

        // Build a normalized lookup once so we match exactly (no substring
        // matching — that would let "لولوة عبدالله مساعدة عبدالعزيز الضبيب"
        // accidentally pick up `عبدالعزيز الضبيب`'s avatar).
        $normalizedOverrides = [];
        foreach (self::R2_AVATAR_OVERRIDES as $key => $filename) {
            $normalizedOverrides[$this->normalizeArabicName($key)] = self::R2_BASE.'/'.$filename;
        }

        $r2OverrideFor = function (string $nameAr) use ($normalizedOverrides): ?string {
            return $normalizedOverrides[$this->normalizeArabicName($nameAr)] ?? null;
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

            $r2Url = $r2OverrideFor($name);
            $existing = Expert::query()->where('email', $email)->first();

            $payload = [
                'name' => $name,
                'phone' => $phone,
                'specialization' => 'KU workshop week',
                'title' => 'Workshop facilitator',
                'bio' => 'Facilitator for the Next Levels training week (April 2026).',
                'is_active' => $isActive,
            ];

            // Set avatar_url only when seeding for the first time, or when the
            // existing value is a placeholder. This keeps any avatar an admin
            // has manually edited via the portal intact across re-seeds.
            $isPlaceholder = $existing && str_starts_with((string) $existing->avatar_url, 'https://ui-avatars.com/');
            if (! $existing || $isPlaceholder || $r2Url) {
                $payload['avatar_url'] = $r2Url ?? $existing?->avatar_url ?? $placeholder($name, $i);
            }

            Expert::query()->updateOrCreate(['email' => $email], $payload);
        }
    }

    /** Strip diacritics and unify alif/ya so name variants match. */
    private function normalizeArabicName(string $name): string
    {
        $name = trim($name);
        $name = preg_replace('/[\x{0610}-\x{0615}\x{064B}-\x{0652}\x{0670}]/u', '', $name);
        $name = preg_replace('/[\x{0623}\x{0625}\x{0622}]/u', "\u{0627}", $name);
        $name = preg_replace('/\x{0649}/u', "\u{064A}", $name);
        $name = preg_replace('/\s+/u', ' ', $name);

        return trim($name);
    }
}
