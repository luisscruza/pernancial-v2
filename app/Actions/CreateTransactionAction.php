<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateTransactionDto;
use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final readonly class CreateTransactionAction
{
    /**
     * Create a new transaction for the given account.
     */
    public function handle(Account $account, CreateTransactionDto $data): void
    {
        DB::transaction(function () use ($account, $data): void {

            if ($data->type === TransactionType::TRANSFER) {
                $this->handleTransfer($account, $data);

                return;
            }

            // Calculate optimistic running balance based on current balance
            $isPositive = $data->type->isPositive();
            $optimisticRunningBalance = $account->balance + ($isPositive ? $data->amount : -$data->amount);

            $transaction = $account->transactions()->create([
                'type' => $data->type,
                'amount' => $data->amount,
                'transaction_date' => $data->transaction_date,
                'description' => $data->description,
                'category_id' => $data->category?->id,
                'destination_account_id' => $data->destination_account?->id,
                'conversion_rate' => 1,
                'converted_amount' => $data->amount,
                'running_balance' => $optimisticRunningBalance,
                'ai_assisted' => $data->ai_assisted,
            ]);

            // Update account balance optimistically
            $account->update(['balance' => $optimisticRunningBalance]);

            if (! $account->currency->is_base) {
                $this->handleConversion($account, $transaction);
            }

            UpdateAccountBalance::dispatch($account, $transaction);
        });
    }

    /**
     * Handle the conversion for non-base currency transactions.
     */
    private function handleConversion(Account $account, Transaction $transaction): void
    {
        $rate = $account->currency->rateForDate($transaction->transaction_date->toDateString());

        $transaction->update([
            'conversion_rate' => $rate,
            'converted_amount' => $transaction->amount * $rate,
        ]);
    }

    /**
     * Handle the transfers.
     */
    private function handleTransfer(Account $account, CreateTransactionDto $data): void
    {
        $outTransaction = $this->handleOutTransfer($account, $data);
        $inTransaction = $this->handleInTransfer($account, $data);

        // Link the two transactions together
        $outTransaction->update(['related_transaction_id' => $inTransaction->id]);
        $inTransaction->update(['related_transaction_id' => $outTransaction->id]);
    }

    private function handleOutTransfer(Account $account, CreateTransactionDto $data): Transaction
    {
        // Calculate optimistic running balance
        $optimisticRunningBalance = $account->balance - $data->amount;

        $transaction = $account->transactions()->create([
            'type' => TransactionType::TRANSFER_OUT,
            'amount' => $data->amount,
            'transaction_date' => $data->transaction_date,
            'description' => $data->description,
            'category_id' => $data->category?->id,
            'destination_account_id' => $data->destination_account?->id,
            'conversion_rate' => $data->conversion_rate,
            'running_balance' => $optimisticRunningBalance,
            'ai_assisted' => $data->ai_assisted,
        ]);

        // Update account balance optimistically
        $account->update(['balance' => $optimisticRunningBalance]);

        UpdateAccountBalance::dispatch($account, $transaction);

        return $transaction;
    }

    private function handleInTransfer(Account $account, CreateTransactionDto $data): Transaction
    {

        if (! $data->destination_account instanceof Account) {
            throw new InvalidArgumentException('Destination account is required for transfer in transactions.');
        }

        // Use received_amount if provided, otherwise use the same amount
        $receivedAmount = $data->received_amount ?? $data->amount;

        // Calculate optimistic running balance
        $optimisticRunningBalance = $data->destination_account->balance + $receivedAmount;

        $transaction = $data->destination_account->transactions()->create([
            'type' => TransactionType::TRANSFER_IN,
            'amount' => $receivedAmount,
            'transaction_date' => $data->transaction_date,
            'description' => $data->description,
            'category_id' => $data->category?->id,
            'destination_account_id' => null,
            'from_account_id' => $account->id,
            'conversion_rate' => $data->conversion_rate,
            'running_balance' => $optimisticRunningBalance,
            'ai_assisted' => $data->ai_assisted,
        ]);

        $data->destination_account->update(['balance' => $optimisticRunningBalance]);

        UpdateAccountBalance::dispatch($data->destination_account, $transaction)->afterCommit();

        return $transaction;
    }
}
