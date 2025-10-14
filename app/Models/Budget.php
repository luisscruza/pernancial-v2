<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BudgetType;
use App\Observers\BudgetObserver;
use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([BudgetObserver::class])]
final class Budget extends Model
{
    /** @use BelongsToUser<Budget> */
    use BelongsToUser;

    use HasFactory;

    /**
     * Get the category for this budget.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the budget period for this budget.
     *
     * @return BelongsTo<BudgetPeriod, $this>
     */
    public function budgetPeriod(): BelongsTo
    {
        return $this->belongsTo(BudgetPeriod::class);
    }

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'type' => BudgetType::class,
            'amount' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
