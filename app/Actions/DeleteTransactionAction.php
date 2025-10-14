<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

final readonly class DeleteTransactionAction
{
    /**
     * Execute the action.
     */
    public function handle(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction): void {

            $account = $transaction->account;

            // Check if this is a transfer transaction with a related transaction
            if (
                ($transaction->type === TransactionType::TRANSFER_OUT || $transaction->type === TransactionType::TRANSFER_IN) &&
                $transaction->related_transaction_id
            ) {
                $relatedTransaction = Transaction::find($transaction->related_transaction_id);

                if ($relatedTransaction) {
                    $relatedAccount = $relatedTransaction->account;
                    $relatedTransaction->delete();

                    // Recalculate balances for the related account
                    UpdateAccountBalance::dispatchSync($relatedAccount, null);
                }
            }

            // Delete the main transaction
            $transaction->delete();

            // Recalculate balances for the main account
            UpdateAccountBalance::dispatchSync($account, null);
        });
    }
}
