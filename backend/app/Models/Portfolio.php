<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Portfolio extends Model
{
    protected $fillable = [
        'name',
        'domain',
        'status',
        'order',
        'owner_id',
        'navbar_template_id',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'portfolio_id');
    }

    public function navbarTemplate(): BelongsTo
    {
        return $this->belongsTo(NavbarTemplate::class);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderByDesc('created_at');
    }
}
