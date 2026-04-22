<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Honor-system "I finished watching the workshop recording" flag.
 * One row per (user_id, event_id); presence implies completion.
 * Required before the user can download the certificate.
 */
class EventCompletion extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
