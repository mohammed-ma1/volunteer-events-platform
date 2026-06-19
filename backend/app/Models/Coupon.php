<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'discount_percent', 'is_active', 'expires_at', 'description',
    ];

    protected function casts(): array
    {
        return [
            'discount_percent' => 'decimal:2',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    /** Normalize codes to uppercase so matching is case-insensitive. */
    public function setCodeAttribute(string $value): void
    {
        $this->attributes['code'] = strtoupper(trim($value));
    }

    /** True when the coupon may be applied right now. */
    public function isRedeemable(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        return $this->expires_at === null || $this->expires_at->isFuture();
    }

    /** Case-insensitive lookup by code. */
    public static function findByCode(?string $code): ?self
    {
        $code = strtoupper(trim((string) $code));
        if ($code === '') {
            return null;
        }

        return self::query()->whereRaw('UPPER(code) = ?', [$code])->first();
    }
}
