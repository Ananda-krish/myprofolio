<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait Sortable
{
    public static function bootSortable(): void
    {
        static::creating(function ($model) {
            if (is_null($model->order)) {
                $query = static::query();
                if (in_array('parent_id', $model->getFillable())) {
                    $query->where('parent_id', $model->parent_id);
                }
                $model->order = ($query->max('order') ?? -1) + 1;
            }
        });
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order');
    }

    public static function reorder(array $moves): void
    {
        $model = new static;
        $hasParent = in_array('parent_id', $model->getFillable());

        DB::transaction(function () use ($moves, $hasParent) {
            foreach ($moves as $move) {
                $update = ['order' => $move['order']];
                if ($hasParent && array_key_exists('parent_id', $move)) {
                    $update['parent_id'] = $move['parent_id'];
                }
                static::where('id', $move['id'])->update($update);
            }
        });
    }
}
