<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\Scopes\TenantScope;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/**
 * @template TModel of Model
 *
 * @mixin TModel
 */
trait BelongsToUser
{
    /**
     * Get the user that owns the model.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function bootBelongsToUser(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function (Model $model): void {
            /** @var TModel $model */
            if (Auth::check() && empty($model->user_id)) {
                $model->user_id = (int) Auth::id();
            }
        });
    }
}
