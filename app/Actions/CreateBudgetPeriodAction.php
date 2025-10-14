<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\BudgetPeriodType;
use App\Enums\BudgetType;
use App\Models\BudgetPeriod;
use Illuminate\Support\Facades\DB;

final class CreateBudgetPeriodAction
{
    /**
     * Create a budget period with multiple category budgets.
     *
     * @param array{
     *     user_id: int,
     *     name: string,
     *     type: string,
     *     start_date: string,
     *     end_date: string,
     *     budgets: array<array{category_id: string, amount: float, name?: string}>
     * } $data
     */
    public function handle(array $data): BudgetPeriod
    {
        return DB::transaction(function () use ($data) {
            // Create the budget period
            $budgetPeriod = BudgetPeriod::create([
                'user_id' => $data['user_id'],
                'name' => $data['name'],
                'type' => BudgetPeriodType::from($data['type']),
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
            ]);

            // Create individual budgets for each category
            foreach ($data['budgets'] as $budgetData) {
                $budgetPeriod->budgets()->create([
                    'user_id' => $data['user_id'],
                    'name' => $budgetData['name'] ?? $this->generateBudgetName($budgetData['category_id'], $data),
                    'amount' => $budgetData['amount'],
                    'type' => BudgetType::PERIOD,
                    'category_id' => $budgetData['category_id'],
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                    'description' => $budgetData['description'] ?? null,
                ]);
            }

            return $budgetPeriod->fresh(['budgets.category']);
        });
    }

    /**
     * Generate a budget name based on category and period.
     */
    private function generateBudgetName($categoryId, array $periodData): string
    {
        // This would ideally load the category to get its name
        // For now, we'll use a generic name
        return $periodData['name'].' - Categoría';
    }
}
