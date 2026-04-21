<?php

namespace App\Support;

class PhoneNumber
{
    /** Default country dialing code applied to bare local numbers. */
    public const DEFAULT_COUNTRY_CODE = '965';

    /**
     * Normalize a free-form phone string into E.164 (+<country><subscriber>).
     *
     * Rules (Kuwait-first, generic-safe):
     *   - Strips spaces, dashes, parentheses and other separators.
     *   - "+9651234..." is left as-is (already E.164).
     *   - "00<cc>..." → "+<cc>...".
     *   - Bare 8-digit numbers are treated as Kuwait local and prefixed with "+965".
     *   - Bare numbers starting with the country code (e.g. "9651234...") are prefixed with "+".
     *   - Anything else returns as a digits-only string with a leading "+" if at least 8 digits.
     *
     * Returns null if the input cannot yield a usable phone (empty / too short).
     */
    public static function normalize(?string $raw, string $defaultCountryCode = self::DEFAULT_COUNTRY_CODE): ?string
    {
        if ($raw === null) {
            return null;
        }

        $trimmed = trim($raw);
        if ($trimmed === '') {
            return null;
        }

        $hasPlus = str_starts_with($trimmed, '+');
        $digits = preg_replace('/\D+/', '', $trimmed) ?? '';

        if ($digits === '') {
            return null;
        }

        if ($hasPlus) {
            return strlen($digits) >= 8 ? '+'.$digits : null;
        }

        if (str_starts_with($digits, '00')) {
            $rest = substr($digits, 2);

            return strlen($rest) >= 8 ? '+'.$rest : null;
        }

        $ccLen = strlen($defaultCountryCode);
        if (strlen($digits) > 8 && str_starts_with($digits, $defaultCountryCode)) {
            return '+'.$digits;
        }

        if (strlen($digits) === 8) {
            return '+'.$defaultCountryCode.$digits;
        }

        if (strlen($digits) >= 8) {
            return '+'.$digits;
        }

        return null;
    }
}
