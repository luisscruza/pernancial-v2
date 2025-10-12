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
        $transfersIn = $this->account->transactions()->where('type', TransactionType::TRANSFER_IN)->whereNotNull('destination_account_id')->sum('amount');
        $transfersOut = $this->account->transactions()->where('type', TransactionType::TRANSFER_OUT)->whereNull('destination_account_id')->sum('amount');
        $initial = $this->account->transactions()->where('type', TransactionType::INITIAL)->sum('amount');

        $this->account->update([
            'balance' => $incomes - $expenses + $transfersIn - $transfersOut + $initial,
        ]);
    }

    /**
     * Update the running balance of the transaction if it exists.
     */
    private function updateRunningBalance(): void
    {
        $this->transaction?->update([
            'running_balance' => $this->account->balance,
        ]);
    }
}
