<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * @template TModel of Model
 *
 * @phpstan-require-extends Model
 *
 * @mixin TModel
 */
trait HasUuidRouting
{
    public static function bootHasUuidRouting(): void
    {
        static::creating(function (Model $model): void {
            if (! Schema::hasColumn($model->getTable(), 'uuid')) {
                return;
            }

            if (empty($model->uuid)) {
                $model->uuid = (string) Str::orderedUuid(); // @phpstan-ignore-line
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
