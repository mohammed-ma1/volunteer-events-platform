<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    /** Purchasable bundle SKU — expands to all KU week schedule workshops on payment. */
    public const SLUG_100_WORKSHOPS_PACKAGE = 'package-100-workshops';

    public const SLUG_PACKAGE_CAREER_PREP = 'package-career-prep';

    public const SLUG_PACKAGE_SOFT_SKILLS = 'package-soft-skills';

    public const SLUG_PACKAGE_AI = 'package-ai';

    public const SLUG_PACKAGE_DIGITAL = 'package-digital';

    /** All category package slugs (excludes the 100-workshop mega-bundle). */
    public const CATEGORY_PACKAGE_SLUGS = [
        self::SLUG_PACKAGE_CAREER_PREP,
        self::SLUG_PACKAGE_SOFT_SKILLS,
        self::SLUG_PACKAGE_AI,
        self::SLUG_PACKAGE_DIGITAL,
    ];

    /** Every purchasable package slug (category + 100-workshop). */
    public const ALL_PACKAGE_SLUGS = [
        self::SLUG_100_WORKSHOPS_PACKAGE,
        self::SLUG_PACKAGE_CAREER_PREP,
        self::SLUG_PACKAGE_SOFT_SKILLS,
        self::SLUG_PACKAGE_AI,
        self::SLUG_PACKAGE_DIGITAL,
    ];

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PENDING_REVIEW = 'pending_review';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'title', 'title_en', 'slug', 'summary', 'summary_en', 'description', 'description_en', 'image_url',
        'starts_at', 'ends_at', 'location', 'location_en', 'zoom_link', 'price', 'currency',
        'capacity', 'is_featured', 'is_published',
        'status', 'created_by', 'approved_by', 'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'price' => 'decimal:3',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function experts(): BelongsToMany
    {
        return $this->belongsToMany(Expert::class, 'event_expert')->withTimestamps();
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('sort_order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
