<?php

namespace Database\Seeders;

use App\Models\NavbarTemplate;
use Illuminate\Database\Seeder;

class NavbarTemplateSeeder extends Seeder
{
    public function run(): void
    {
        if (NavbarTemplate::count() > 0) {
            return;
        }

        NavbarTemplate::create([
            'name'   => 'Default Dark',
            'config' => [
                'background' => [
                    'style'   => 'solid',
                    'color'   => '#0a0a0c',
                    'opacity' => 100,
                ],
                'height' => [
                    'mode'        => 'normal',
                    'base_px'     => 64,
                    'expanded_px' => 96,
                ],
                'position' => 'top',
                'logo' => [
                    'url'      => null,
                    'position' => 'left',
                ],
                'colors' => [
                    'text'                => '#d1d5db',
                    'text_hover'          => '#3ED9C4',
                    'text_active'         => '#3ED9C4',
                    'background_scrolled' => null,
                ],
                'hover_effect' => 'underline',
                'secondary_layer' => [
                    'enabled'          => false,
                    'background_color' => '#111827',
                    'content_type'     => 'text',
                    'text'             => null,
                    'links'            => null,
                ],
                'search' => [
                    'enabled'     => false,
                    'placeholder' => 'Search...',
                ],
                'below_navbar_carousel' => [
                    'enabled'     => false,
                    'autoplay_ms' => 4000,
                    'items'       => [],
                ],
            ],
        ]);

        NavbarTemplate::create([
            'name'   => 'Glass Minimal',
            'config' => [
                'background' => [
                    'style'   => 'glass',
                    'color'   => '#0a0a0c',
                    'opacity' => 60,
                ],
                'height' => [
                    'mode'        => 'blade',
                    'base_px'     => 52,
                    'expanded_px' => 80,
                ],
                'position' => 'top',
                'logo' => [
                    'url'      => null,
                    'position' => 'left',
                ],
                'colors' => [
                    'text'                => '#a1a1aa',
                    'text_hover'          => '#ffffff',
                    'text_active'         => '#ffffff',
                    'background_scrolled' => '#0a0a0ccc',
                ],
                'hover_effect' => 'glow',
                'secondary_layer' => [
                    'enabled'          => false,
                    'background_color' => '#111827',
                    'content_type'     => 'text',
                    'text'             => null,
                    'links'            => null,
                ],
                'search' => [
                    'enabled'     => false,
                    'placeholder' => 'Search...',
                ],
                'below_navbar_carousel' => [
                    'enabled'     => false,
                    'autoplay_ms' => 4000,
                    'items'       => [],
                ],
            ],
        ]);
    }
}
