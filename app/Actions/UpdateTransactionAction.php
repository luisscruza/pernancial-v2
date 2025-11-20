<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateTransactionDto;
use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

final readonly class UpdateTransactionAction
{
    /**
     * Update an existing transaction.
     */
    public function handle(Transaction $transaction, CreateTransactionDto $data): void
    {
        DB::transaction(function () use ($transaction, $data): void {
            $account = $transaction->account;

            // Check if this is a transfer transaction
            if ($transaction->type === TransactionType::TRANSFER_OUT || $transaction->type === TransactionType::TRANSFER_IN) {
                $this->handleTransferUpdate($transaction, $data);

                return;
            }

            // Update regular transaction
            $this->updateTransaction($transaction, $data);

            // Recalculate balances for this account asynchronously
            UpdateAccountBalance::dispatch($account, $transaction);
        });
    }

    private function handleTransferUpdate(Transaction $transaction, CreateTransactionDto $data): void
    {
        // Load the related transaction
        $relatedTransaction = Transaction::find($transaction->related_transaction_id);

        if (! $relatedTransaction) {
            // If no related transaction, treat as regular transaction
            $this->updateTransaction($transaction, $data);
            UpdateAccountBalance::dispatch($transaction->account, $transaction);

            return;
        }

        // Determine which is OUT and which is IN
        $outTransaction = $transaction->type === TransactionType::TRANSFER_OUT ? $transaction : $relatedTransaction;
        $inTransaction = $transaction->type === TransactionType::TRANSFER_IN ? $transaction : $relatedTransaction;

        // Update OUT transaction (amount sent)
        $outTransaction->update([
            'amount' => $data->amount,
            'transaction_date' => $data->transaction_date,
            'description' => $data->description,
            'destination_account_id' => $data->destination_account?->id,
        ]);

        // Update IN transaction (amount received)
        $receivedAmount = $data->received_amount ?? $data->amount;
        $inTransaction->update([
            'amount' => $receivedAmount,
            'transaction_date' => $data->transaction_date,
            'description' => $data->description,
            'from_account_id' => $outTransaction->account_id,
        ]);

        // Recalculate balances for both accounts asynchronously
        UpdateAccountBalance::dispatch($outTransaction->account, $outTransaction);
        UpdateAccountBalance::dispatch($inTransaction->account, $inTransaction);
    }

    private function updateTransaction(Transaction $transaction, CreateTransactionDto $data): void
    {
        $account = $transaction->account;

        // Update the transaction
        $transaction->update([
            'type' => $data->type,
            'amount' => $data->amount,
            'transaction_date' => $data->transaction_date,
            'description' => $data->description,
            'category_id' => $data->category?->id,
            'destination_account_id' => $data->destination_account?->id,
        ]);

        // Handle conversion if needed
        if (! $account->currency->is_base) {
            $rate = $account->currency->rateForDate($transaction->transaction_date->toDateString());

            $transaction->update([
                'conversion_rate' => $rate,
                'converted_amount' => $transaction->amount * $rate,
            ]);
        } else {
            $transaction->update([
                'conversion_rate' => 1,
                'converted_amount' => $data->amount,
            ]);
        }
    }
}
