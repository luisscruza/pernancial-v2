<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class UpdateAccountBalance implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Account $account,
        public ?Transaction $transaction,
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->updateBalance();
        $this->updateRunningBalance();
    }

    /**
     * Update the account balance based on its transactions.
     */
    private function updateBalance(): void
    {
        $expenses = $this->account->transactions()->where('type', TransactionType::EXPENSE)->sum('amount');
        $incomes = $this->account->transactions()->where('type', TransactionType::INCOME)->sum('amount');
        $transfersIn = $this->account->transactions()->where('type', TransactionType::TRANSFER_IN)->sum('amount');
        $transfersOut = $this->account->transactions()->where('type', TransactionType::TRANSFER_OUT)->sum('amount');
        $initial = $this->account->transactions()->where('type', TransactionType::INITIAL)->sum('amount');
        $adjustmentsNegative = $this->account->transactions()->where('type', TransactionType::ADJUSTMENT_NEGATIVE)->sum('amount');
        $adjustmentsPositive = $this->account->transactions()->where('type', TransactionType::ADJUSTMENT_POSITIVE)->sum('amount');
        $this->account->update([
            'balance' => $incomes - $expenses + $transfersIn - $transfersOut + $initial + $adjustmentsPositive - $adjustmentsNegative,
        ]);
    }

    /**
     * Update the running balance of the transaction if it exists.
     */
    private function updateRunningBalance(): void
    {
        // Then this will be a queued job to avoid slowing down the main process...
        $transactions = $this->account->transactions()
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();

        $runningBalance = 0;

        foreach ($transactions as $transaction) {
            $type = $transaction->type; // Instance of TransactionType

            $runningBalance += $type->isPositive()
                ? $transaction->amount
                : -$transaction->amount;

            $transaction->update([
                'running_balance' => $runningBalance,
            ]);
        }
    }
}
