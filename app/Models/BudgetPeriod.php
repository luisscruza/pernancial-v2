<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BudgetPeriodType;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BudgetPeriod extends Model
{
    /** @use BelongsToUser<BudgetPeriod> */
    use BelongsToUser;

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
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'type' => BudgetPeriodType::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
