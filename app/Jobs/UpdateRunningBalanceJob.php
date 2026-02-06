<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Account;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class UpdateRunningBalanceJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Account $account,
    ) {
        $this->afterCommit();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $transactions = $this->account->transactions()
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();

        $runningBalance = 0.0;

        foreach ($transactions as $transaction) {
            $runningBalance += $transaction->type->isPositive()
                ? $transaction->amount
                : -$transaction->amount;

            $transaction->updateQuietly([
                'running_balance' => $runningBalance,
            ]);
        }
    }
}
