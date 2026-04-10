<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Cart extends Model
{
    protected $fillable = ['token', 'expires_at'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public static function createWithToken(): self
    {
        return self::query()->create([
            'token' => (string) Str::uuid(),
            'expires_at' => now()->addDays(7),
        ]);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }
}
