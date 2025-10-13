<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
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

        $this->account->update([
            'balance' => $incomes - $expenses + $transfersIn - $transfersOut + $initial,
        ]);
    }

    /**
     * Update the running balance of the transaction if it exists.
     */
    private function updateRunningBalance(): void
    {
        $transactions = $this->account->transactions()
            ->when($this->transaction instanceof Transaction, function (Builder $query): void {
                $query->where('transaction_date', '>=', $this->transaction?->transaction_date)
                    ->orWhere(function (Builder $q): void {
                        $q->where('transaction_date', $this->transaction?->transaction_date)
                            ->where('id', '>=', $this->transaction?->id);
                    });
            })
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();

        $runningBalance = 0.0;

        foreach ($transactions as $transaction) {
            /** @var TransactionType $type */
            $type = $transaction->type;

            if (in_array($type, [
                TransactionType::INCOME,
                TransactionType::TRANSFER_IN,
                TransactionType::INITIAL,
            ], true)) {
                $runningBalance += $transaction->amount;
            } elseif (in_array($type, [
                TransactionType::EXPENSE,
                TransactionType::TRANSFER_OUT,
            ], true)) {
                $runningBalance -= $transaction->amount;
            }

            $transaction->update(['running_balance' => $runningBalance]);

        }
    }
}
