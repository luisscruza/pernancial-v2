<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * @template TModel of Model
 *
 * @mixin TModel
 */
trait HasUuidRouting
{
    public static function bootHasUuidRouting(): void
    {
        static::creating(function (Model $model): void {
            if (Schema::hasColumn($model->getTable(), $model->getUuidColumnName()) && is_null($model->{$model->getUuidColumnName()})) {
                $model->{$model->getUuidColumnName()} = Str::orderedUuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return $this->getUuidColumnName();
    }

    public function getUuidColumnName(): string
    {
        return 'uuid';
    }
}
