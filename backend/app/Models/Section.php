<?php

namespace App\Models;

use App\Traits\Sortable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Section extends Model implements HasMedia
{
    use Sortable;
    use InteractsWithMedia;

    protected $fillable = [
        'page_id',
        'type',
        'content',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'content' => 'array',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('gallery');
        $this->addMediaCollection('hero_background')->singleFile();
    }

    public function getContentAttribute($value)
    {
        $content = json_decode($value, true);
        if (is_array($content)) {
            $content = match ($this->type) {
                'hero' => static::normalizeHeroContent($content),
                'text' => static::normalizeTextContent($content),
                'gallery' => static::normalizeGalleryContent($content),
                default => $content,
            };
        }
        return $content;
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Normalize old-format hero content to the new schema, filling defaults.
     */
    public static function normalizeHeroContent(array $content): array
    {
        $textDefaults = fn (?array $existing) => [
            'text' => $existing['text'] ?? $existing ?? '',
            'color' => $existing['color'] ?? null,
            'weight' => $existing['weight'] ?? ($existing['bold'] ? 700 : 400),
            'fontSize' => $existing['fontSize'] ?? 'md',
            'visible' => $existing['visible'] ?? true,
        ];

        // Migrate old flat format
        if (isset($content['heading']) && is_string($content['heading'])) {
            $content = [
                'heading' => ['text' => $content['heading'], 'color' => null, 'weight' => 400, 'fontSize' => 'xl', 'visible' => true],
                'subheading' => ['text' => $content['subheading'] ?? '', 'color' => null, 'weight' => 400, 'fontSize' => 'md', 'visible' => !empty($content['subheading'])],
                'paragraphs' => [],
                'background' => [
                    'image' => $content['background_image'] ?? null,
                    'overlay_opacity' => 40,
                    'fallback_color' => '#111827',
                    'focal_point' => 'center',
                ],
                'layout' => [
                    'anchor' => 'center',
                    'text_align' => 'center',
                    'height' => 'large',
                    'max_width' => 'medium',
                ],
                'spacing' => [
                    'padding' => 'md',
                    'element_gap' => 'md',
                ],
                'cta' => [
                    'text' => $content['cta_text'] ?? null,
                    'link' => $content['cta_link'] ?? null,
                    'variant' => 'solid',
                    'color' => null,
                ],
            ];
        }

        // Ensure all keys exist with defaults
        $content['heading'] = $textDefaults($content['heading'] ?? null);
        $content['subheading'] = $textDefaults($content['subheading'] ?? null);
        $content['paragraphs'] = array_map($textDefaults, $content['paragraphs'] ?? []);

        $content['background'] = array_merge([
            'image' => null, 'overlay_opacity' => 40, 'fallback_color' => '#111827', 'focal_point' => 'center',
        ], $content['background'] ?? []);

        $content['layout'] = array_merge([
            'anchor' => 'center', 'text_align' => 'center', 'height' => 'large', 'max_width' => 'medium',
        ], $content['layout'] ?? []);

        $content['spacing'] = array_merge([
            'padding' => 'md', 'element_gap' => 'md',
        ], $content['spacing'] ?? []);

        $content['cta'] = array_merge([
            'text' => null, 'link' => null, 'variant' => 'solid', 'color' => null,
        ], $content['cta'] ?? []);

        return $content;
    }

    /**
     * Normalize text section content, migrating old flat 'body' format.
     */
    public static function normalizeTextContent(array $content): array
    {
        $textDefaults = fn (?array $existing) => [
            'text' => $existing['text'] ?? $existing ?? '',
            'color' => $existing['color'] ?? null,
            'weight' => $existing['weight'] ?? ($existing['bold'] ? 700 : 400),
            'fontSize' => $existing['fontSize'] ?? 'md',
            'visible' => $existing['visible'] ?? true,
        ];

        // Migrate old flat body format
        if (isset($content['body']) && is_string($content['body'])) {
            $content = [
                'heading' => ['text' => '', 'color' => null, 'weight' => 400, 'fontSize' => 'xl', 'visible' => false],
                'subheading' => ['text' => '', 'color' => null, 'weight' => 400, 'fontSize' => 'md', 'visible' => false],
                'paragraphs' => [['text' => $content['body'], 'color' => null, 'weight' => 400, 'fontSize' => 'md', 'visible' => true]],
                'layout' => ['anchor' => 'center', 'text_align' => 'center', 'height' => 'large', 'max_width' => 'medium'],
                'spacing' => ['padding' => 'md', 'element_gap' => 'md'],
            ];
        }

        $content['heading'] = $textDefaults($content['heading'] ?? null);
        $content['subheading'] = $textDefaults($content['subheading'] ?? null);
        $content['paragraphs'] = array_map($textDefaults, $content['paragraphs'] ?? []);
        if (empty($content['paragraphs'])) {
            $content['paragraphs'] = [$textDefaults(null)];
        }

        $content['layout'] = array_merge([
            'anchor' => 'center', 'text_align' => 'center', 'height' => 'large', 'max_width' => 'medium',
        ], $content['layout'] ?? []);

        $content['spacing'] = array_merge([
            'padding' => 'md', 'element_gap' => 'md',
        ], $content['spacing'] ?? []);

        return $content;
    }

    /**
     * Normalize gallery section content, migrating old url-only image arrays.
     */
    public static function normalizeGalleryContent(array $content): array
    {
        // Migrate old format: array of plain URL strings
        if (isset($content['images']) && is_array($content['images']) && !empty($content['images']) && is_string($content['images'][0])) {
            $content['images'] = array_map(fn ($url) => ['url' => $url, 'caption' => null], $content['images']);
        }

        // Normalize each image entry
        $content['images'] = array_map(fn ($img) => [
            'url' => $img['url'] ?? '',
            'caption' => $img['caption'] ?? null,
        ], $content['images'] ?? []);

        $content['layout'] = array_merge([
            'height' => 'large', 'max_width' => 'full',
        ], $content['layout'] ?? []);

        $content['spacing'] = array_merge([
            'padding' => 'md', 'element_gap' => 'md',
        ], $content['spacing'] ?? []);

        $content['grid'] = array_merge([
            'columns' => 3, 'aspect_ratio' => 'square',
        ], $content['grid'] ?? []);

        return $content;
    }

    /**
     * Validate content structure for a given type.
     * Returns validated and normalized content or throws ValidationException.
     */
    public static function validateContent(string $type, ?array $content): array
    {
        if (!in_array($type, ['hero', 'text', 'gallery'])) {
            throw ValidationException::withMessages(['type' => 'Invalid section type.']);
        }

        if (!is_array($content)) {
            throw ValidationException::withMessages(['content' => 'Content must be an array.']);
        }

        if ($type === 'hero') {
            $content = static::normalizeHeroContent($content);
            return $content;
        }

        if ($type === 'text') {
            $content = static::normalizeTextContent($content);
            return $content;
        }

        if ($type === 'gallery') {
            $content = static::normalizeGalleryContent($content);
            if (empty(array_filter($content['images'], fn ($img) => !empty(trim($img['url']))))) {
                throw ValidationException::withMessages(['content.images' => 'At least one image is required.']);
            }
            return $content;
        }

        return $content;
    }
}
