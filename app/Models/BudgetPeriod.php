<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BudgetPeriodType;
use App\Traits\BelongsToUser;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read int $id
 * @property-read int $user_id
 * @property-read string $name
 * @property-read BudgetPeriodType $type
 * @property-read Carbon $start_date
 * @property-read Carbon $end_date
 * @property-read bool $is_active
 * @property-read Carbon|null $created_at
 * @property-read Carbon|null $updated_at
 */
final class BudgetPeriod extends Model
{
    /** @use BelongsToUser<BudgetPeriod> */
    use BelongsToUser;

    /** @use HasFactory<BudgetPeriod> */
    use HasFactory;

    /**
     * Get the budgets for this period.
     *
     * @return HasMany<Budget, $this>
     */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * Check if this budget period is currently active.
     */
    public function isCurrent(): bool
    {
        $now = now();

        return $now->between($this->start_date, $this->end_date);
    }

    /**
     * Scope to get only current budget periods.
     *
     * @param  Builder<BudgetPeriod>  $query
     * @return Builder<BudgetPeriod>
     */
    public function scopeCurrent(Builder $query): Builder
    {
        $now = now();

        return $query->where('start_date', '<=', $now)
            ->where('end_date', '>=', $now);
    }

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'user_id' => 'integer',
            'type' => BudgetPeriodType::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
