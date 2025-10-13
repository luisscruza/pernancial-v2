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

            $transaction = $account->transactions()->create([
                'type' => $data->type,
                'amount' => $data->amount,
                'transaction_date' => $data->transaction_date,
                'description' => $data->description,
                'category_id' => $data->category?->id,
                'destination_account_id' => $data->destination_account?->id,
                'conversion_rate' => 1,
                'converted_amount' => $data->amount,
                'running_balance' => 0,
            ]);

            if (! $account->currency->is_base) {
                $this->handleConversion($account, $transaction);
            }

            UpdateAccountBalance::dispatchSync($account, $transaction);
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
        $this->handleOutTransfer($account, $data);
        $this->handleInTransfer($account, $data);
    }

    private function handleOutTransfer(Account $account, CreateTransactionDto $data): void
    {
        $transaction = $account->transactions()->create([
            'type' => TransactionType::TRANSFER_OUT,
            'amount' => $data->amount,
            'transaction_date' => $data->transaction_date,
            'description' => $data->description,
            'category_id' => $data->category?->id,
            'destination_account_id' => $data->destination_account?->id,
            'conversion_rate' => $data->conversion_rate,
            'running_balance' => 0,
        ]);

        UpdateAccountBalance::dispatchSync($account, $transaction);
    }

    private function handleInTransfer(Account $account, CreateTransactionDto $data): void
    {

        if (! $data->destination_account instanceof Account) {
            throw new InvalidArgumentException('Destination account is required for transfer in transactions.');
        }

        $transaction = $data->destination_account->transactions()->create([
            'type' => TransactionType::TRANSFER_IN,
            'amount' => $data->amount,
            'transaction_date' => $data->transaction_date,
            'description' => $data->description,
            'category_id' => $data->category?->id,
            'destination_account_id' => null,
            'from_account_id' => $account->id,
            'conversion_rate' => $data->conversion_rate,
            'running_balance' => 0,
        ]);

        UpdateAccountBalance::dispatchSync($data->destination_account, $transaction);
    }
}
