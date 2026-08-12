<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NavbarTemplate extends Model
{
    protected $fillable = [
        'name',
        'config',
    ];

    protected $casts = [
        'config' => 'array',
    ];

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    public static function defaultConfig(): array
    {
        return [
            'background' => [
                'style'   => 'solid',
                'color'   => '#0a0a0c',
                'opacity' => 100,
            ],
            'height' => [
                'left_px'          => 64,
                'center_px'        => 64,
                'right_px'         => 64,
                'blade_enabled'    => false,
                'blade_expanded_px' => 96,
            ],
            'position' => 'top',
            'logo' => [
                'url'      => null,
                'position' => 'left',
                'size'     => 36,
            ],
            'colors' => [
                'text'               => '#d1d5db',
                'text_hover'         => '#3ED9C4',
                'text_active'        => '#3ED9C4',
                'background_scrolled' => null,
            ],
            'hover_effect' => 'underline',
            'secondary_layer' => [
                'enabled'         => false,
                'background_color' => '#111827',
                'content_type'    => 'text',
                'text'            => null,
                'links'           => null,
            ],
            'search' => [
                'enabled'     => false,
                'placeholder' => 'Search...',
            ],
            'below_navbar_carousel' => [
                'enabled'    => false,
                'autoplay_ms' => 4000,
                'items'      => [],
            ],
        ];
    }

    public function resolvedConfig(): array
    {
        $raw = array_replace_recursive(self::defaultConfig(), $this->config ?? []);
        return self::normalizeHeight($raw);
    }

    private static function normalizeHeight(array $config): array
    {
        $h = &$config['height'];

        if (isset($h['mode'])) {
            $preset = match ($h['mode']) {
                'compact' => 48,
                'normal'  => 64,
                'tall'    => 80,
                default   => 64,
            };
            $base = $h['base_px'] ?? $preset;
            $expanded = $h['expanded_px'] ?? ($base + 32);

            $h = [
                'left_px'           => $base,
                'center_px'         => $base,
                'right_px'          => $base,
                'blade_enabled'     => ($h['mode'] === 'blade'),
                'blade_expanded_px' => $expanded,
            ];
            $config['height'] = $h;
        }

        $h['left_px']          = $h['left_px'] ?? 64;
        $h['center_px']        = $h['center_px'] ?? 64;
        $h['right_px']         = $h['right_px'] ?? 64;
        $h['blade_enabled']    = $h['blade_enabled'] ?? false;
        $h['blade_expanded_px'] = $h['blade_expanded_px'] ?? 96;

        return $config;
    }
}
