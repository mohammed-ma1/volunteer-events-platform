<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'title', 'title_en', 'slug', 'summary', 'summary_en', 'description', 'image_url',
        'starts_at', 'ends_at', 'location', 'location_en', 'price', 'currency',
        'capacity', 'is_featured', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'price' => 'decimal:3',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
