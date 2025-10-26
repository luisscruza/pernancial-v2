<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\CacheBudgetPeriodSummaryAction;
use App\Models\BudgetPeriod;
use App\Models\Transaction;

final readonly class TransactionObserver
{
    public function __construct(
        private CacheBudgetPeriodSummaryAction $cacheAction
    ) {}

    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->invalidateBudgetPeriodCache($transaction);
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        $this->invalidateBudgetPeriodCache($transaction);
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->invalidateBudgetPeriodCache($transaction);
    }

    /**
     * Handle the Transaction "restored" event.
     */
    public function restored(Transaction $transaction): void
    {
        $this->invalidateBudgetPeriodCache($transaction);
    }

    /**
     * Invalidate cache for all budget periods that this transaction affects.
     */
    private function invalidateBudgetPeriodCache(Transaction $transaction): void
    {
        if (! $transaction->category_id) {
            return;
        }

        // Find all budget periods that contain this transaction date
        $affectedPeriods = BudgetPeriod::where('user_id', $transaction->account->user_id)
            ->where('start_date', '<=', $transaction->transaction_date)
            ->where('end_date', '>=', $transaction->transaction_date)
            ->get();

        foreach ($affectedPeriods as $period) {
            $this->cacheAction->invalidate($period);
        }
    }
}
