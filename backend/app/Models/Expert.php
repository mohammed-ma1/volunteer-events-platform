<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Expert extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar_url',
        'bio',
        'specialization',
        'title',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_expert')->withTimestamps();
    }
}
