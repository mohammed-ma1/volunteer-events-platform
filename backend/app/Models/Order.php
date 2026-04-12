<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    public const STATUS_PENDING_PAYMENT = 'pending_payment';

    public const STATUS_AWAITING_REDIRECT = 'awaiting_redirect';

    public const STATUS_PAID = 'paid';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'uuid', 'idempotency_key', 'email', 'customer_name', 'phone',
        'status', 'subtotal', 'total', 'currency', 'tap_charge_id',
        'tap_payment_url', 'paid_at', 'receipt_email_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:3',
            'total' => 'decimal:3',
            'paid_at' => 'datetime',
            'receipt_email_sent_at' => 'datetime',
        ];
    }

    public static function createFresh(array $attributes = []): self
    {
        return self::query()->create(array_merge([
            'uuid' => (string) Str::uuid(),
            'status' => self::STATUS_PENDING_PAYMENT,
        ], $attributes));
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Human-friendly reference for receipts (e.g. KW-000471). */
    public function invoiceReference(): string
    {
        return 'KW-'.str_pad((string) $this->getKey(), 6, '0', STR_PAD_LEFT);
    }
}
