<?php

declare(strict_types=1);

namespace App\Actions;

use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

final readonly class CreateTransactionAction
{
    /**
     * Invoke the class instance.
     *
     * @param  array{type: string, amount: float, transaction_date: string, description: string, destination_account_id: int|null, category_id: int|null, conversion_rate: float|null, converted_amount: float|null, running_balance: float, destination_running_balance: float|null}  $data
     */
    public function handle(Account $account, array $data): void
    {
        DB::transaction(function () use ($account, $data): void {
            $account->transactions()->create([
                'user_id' => $account->user_id,
                'type' => $data['type'],
                'amount' => $data['amount'],
                'transaction_date' => $data['transaction_date'],
                'description' => $data['description'],
                'category_id' => $data['category_id'] ?? null,
                'running_balance' => 0,
            ]);

            UpdateAccountBalance::dispatch($account);
        });
    }
}
