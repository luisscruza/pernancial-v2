<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\CategoryType;
use App\Models\BudgetPeriod;
use Illuminate\Support\Facades\Cache;

final class CacheBudgetPeriodSummaryAction
{
    public function __construct(
        private readonly CalculateBudgetSummaryAction $calculateAction
    ) {}

    /**
     * Get or calculate budget period summary with caching.
     * Current periods are always calculated fresh, old periods are cached.
     */
    public function handle(BudgetPeriod $period): array
    {
        $isCurrent = $this->isCurrent($period);

        // If it's the current period, always calculate fresh
        if ($isCurrent) {
            return $this->calculateSummary($period);
        }

        // For old periods, use cache with a long TTL (30 days)
        $cacheKey = $this->getCacheKey($period);

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($period) {
            return $this->calculateSummary($period);
        });
    }

    /**
     * Invalidate cache for a specific budget period.
     */
    public function invalidate(BudgetPeriod $period): void
    {
        Cache::forget($this->getCacheKey($period));
    }

    /**
     * Calculate the summary data for a budget period.
     */
    private function calculateSummary(BudgetPeriod $period): array
    {
        $totalExpenseSpent = 0;
        $totalIncomeReceived = 0;

        if ($period->budgets) {
            foreach ($period->budgets as $budget) {
                $summary = $this->calculateAction->handle($budget);

                if ($budget->category->type === CategoryType::EXPENSE) {
                    $totalExpenseSpent += $summary->totalSpent;
                } elseif ($budget->category->type === CategoryType::INCOME) {
                    $totalIncomeReceived += $summary->totalSpent;
                }
            }
        }

        return [
            'total_expense_spent' => $totalExpenseSpent,
            'total_income_received' => $totalIncomeReceived,
            'total_spent' => $totalExpenseSpent, // Keep for backward compatibility
        ];
    }

    /**
     * Check if a budget period is current (active now).
     */
    private function isCurrent(BudgetPeriod $period): bool
    {
        $now = now();

        return $now->between($period->start_date, $period->end_date);
    }

    /**
     * Generate cache key for a budget period.
     */
    private function getCacheKey(BudgetPeriod $period): string
    {
        return "budget_period_summary_{$period->id}";
    }
}
