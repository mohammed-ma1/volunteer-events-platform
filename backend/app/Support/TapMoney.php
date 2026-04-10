<?php

namespace App\Support;

final class TapMoney
{
    /** @var array<string, int> ISO minor units / display decimals per Tap docs */
    private const DECIMALS = [
        'BHD' => 3, 'KWD' => 3, 'OMR' => 3, 'JOD' => 3,
        'AED' => 2, 'QAR' => 2, 'SAR' => 2, 'USD' => 2, 'EUR' => 2,
        'GBP' => 2, 'EGP' => 2,
    ];

    public static function decimalsFor(string $currency): int
    {
        return self::DECIMALS[strtoupper($currency)] ?? 2;
    }

    public static function formatAmount(float|string|int $amount, string $currency): string
    {
        $decimals = self::decimalsFor($currency);

        return number_format((float) $amount, $decimals, '.', '');
    }
}
