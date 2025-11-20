<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\BudgetType;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class UpdateBudgetPeriodAction
{
    /**
     * Execute the action.
     *
     * @param  array<int, array{category_id: int, amount: float}>  $budgets
     */
    public function handle(BudgetPeriod $budgetPeriod, array $budgets, User $user, string $name): void
    {
        DB::transaction(function () use ($budgetPeriod, $budgets, $user, $name): void {

            $budgetPeriod->update([
                'name' => $name,
            ]);

            foreach ($budgets as $budget) {
                Budget::updateOrCreate([
                    'category_id' => $budget['category_id'],
                    'user_id' => $user->id,
                    'budget_period_id' => $budgetPeriod->id,
                    'type' => BudgetType::PERIOD,
                ], [
                    'amount' => $budget['amount'],
                ]);
            }
        });
    }
}
