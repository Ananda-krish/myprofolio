<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'name',
        'domain',
        'theme_config',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'theme_config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }
}
