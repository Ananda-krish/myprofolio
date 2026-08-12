<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'label',
        'icon',
        'route_path',
        'parent_id',
        'order',
        'is_active',
        'portfolio_id',
        'link_type',
        'style',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'style'     => 'array',
    ];

    public static function defaultStyle(): array
    {
        return [
            'color'      => null,
            'bold'       => false,
            'fontSize'   => 'md',
            'split_fill' => [
                'enabled'       => false,
                'top_color'     => '#3ED9C4',
                'bottom_color'  => '#8B5CF6',
                'split_percent' => 50,
            ],
        ];
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public static function buildNestedTree(array $items, string $key = 'id', string $parentKey = 'parent_id', string $collectionKey = 'children'): array
    {
        $grouped = [];
        foreach ($items as $item) {
            $parentId = $item[$parentKey] ?? null;
            $grouped[$parentId][] = $item;
        }

        $tree = self::buildLevel($grouped, null, $key, $collectionKey);
        return $tree;
    }

    private static function buildLevel(array &$grouped, ?int $parentId, string $key, string $collectionKey): array
    {
        $items = $grouped[$parentId] ?? [];
        $result = [];
        foreach ($items as $item) {
            $item[$collectionKey] = self::buildLevel($grouped, $item[$key], $key, $collectionKey);
            $result[] = $item;
        }
        return $result;
    }

    public static function reorder(array $moves): void
    {
        foreach ($moves as $move) {
            static::where('id', $move['id'])->update([
                'order'     => $move['order'],
                'parent_id' => $move['parent_id'] ?? null,
            ]);
        }
    }
}
