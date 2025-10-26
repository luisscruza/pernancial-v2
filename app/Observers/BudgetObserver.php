<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\CacheBudgetPeriodSummaryAction;
use App\Models\Budget;

final readonly class BudgetObserver
{
    public function __construct(
        private CacheBudgetPeriodSummaryAction $cacheAction
    ) {}

    /**
     * Handle the Budget "created" event.
     */
    public function created(Budget $budget): void
    {
        $this->invalidateBudgetPeriodCache($budget);
    }

    /**
     * Handle the Budget "updated" event.
     */
    public function updated(Budget $budget): void
    {
        $this->invalidateBudgetPeriodCache($budget);
    }

    /**
     * Handle the Budget "deleted" event.
     */
    public function deleted(Budget $budget): void
    {
        $this->invalidateBudgetPeriodCache($budget);
    }

    /**
     * Handle the Budget "restored" event.
     */
    public function restored(Budget $budget): void
    {
        $this->invalidateBudgetPeriodCache($budget);
    }

    /**
     * Handle the Budget "force deleted" event.
     */
    public function forceDeleted(Budget $budget): void
    {
        $this->invalidateBudgetPeriodCache($budget);
    }

    /**
     * Invalidate cache for the budget period that this budget belongs to.
     */
    private function invalidateBudgetPeriodCache(Budget $budget): void
    {
        if ($budget->budget_period_id && $budget->budgetPeriod) {
            $this->cacheAction->invalidate($budget->budgetPeriod);
        }
    }
}
