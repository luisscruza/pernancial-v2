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
/**
 * @property-read int $id
 * @property-read int $user_id
 * @property-read int $category_id
 * @property-read int $budget_period_id
 * @property-read BudgetType $type
 * @property-read string|null $name
 * @property-read string|null $description
 * @property-read float|null $amount
 * @property-read Carbon|null $start_date
 * @property-read Carbon|null $end_date
 * @property-read bool $is_active
 * @property-read Carbon|null $created_at
 * @property-read Carbon|null $updated_at
 */
final class Budget extends Model
{
    /** @use BelongsToUser<Budget> */
    use BelongsToUser;

    /** @use HasFactory<Budget> */
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
            'id' => 'integer',
            'user_id' => 'integer',
            'category_id' => 'integer',
            'budget_period_id' => 'integer',
            'type' => BudgetType::class,
            'amount' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
