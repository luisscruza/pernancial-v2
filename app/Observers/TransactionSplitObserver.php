<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\CacheBudgetPeriodSummaryAction;
use App\Models\BudgetPeriod;
use App\Models\TransactionSplit;

final readonly class TransactionSplitObserver
{
    public function __construct(
        private CacheBudgetPeriodSummaryAction $cacheAction
    ) {}

    /**
     * Handle the TransactionSplit "created" event.
     */
    public function created(TransactionSplit $split): void
    {
        $this->invalidateBudgetPeriodCache($split);
    }

    /**
     * Handle the TransactionSplit "updated" event.
     */
    public function updated(TransactionSplit $split): void
    {
        $this->invalidateBudgetPeriodCache($split);
    }

    /**
     * Handle the TransactionSplit "deleted" event.
     */
    public function deleted(TransactionSplit $split): void
    {
        $this->invalidateBudgetPeriodCache($split);
    }

    /**
     * Invalidate cache for all budget periods that this split affects.
     */
    private function invalidateBudgetPeriodCache(TransactionSplit $split): void
    {
        if (! $split->category_id) {
            return;
        }

        $transaction = $split->transaction;

        if (! $transaction) {
            return;
        }

        $affectedPeriods = BudgetPeriod::where('user_id', $transaction->account?->user_id)
            ->where('start_date', '<=', $transaction->transaction_date)
            ->where('end_date', '>=', $transaction->transaction_date)
            ->get();

        foreach ($affectedPeriods as $period) {
            $this->cacheAction->invalidate($period);
        }
    }
}
