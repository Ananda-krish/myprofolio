<?php

namespace App\Models;

use App\Traits\Sortable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Page extends Model implements HasMedia
{
    use Sortable;
    use InteractsWithMedia;

    protected $fillable = [
        'portfolio_id',
        'title',
        'slug',
        'order',
        'status',
        'model_config',
    ];

    protected $casts = [
        'order' => 'integer',
        'model_config' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (Page $page) {
            if (empty($page->slug)) {
                $page->slug = Str::slug($page->title);
            }
        });

        static::updating(function (Page $page) {
            if ($page->isDirty('title') && !$page->isDirty('slug')) {
                $page->slug = Str::slug($page->title);
            }
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('page_model')->singleFile();
    }

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class)->orderBy('order');
    }

    public static function defaultModelConfig(): array
    {
        return [
            'glb_url' => null,
            'idle' => ['rotation_speed' => 0.2],
            'hover' => ['scale' => 1.15, 'color' => null],
        ];
    }
}
