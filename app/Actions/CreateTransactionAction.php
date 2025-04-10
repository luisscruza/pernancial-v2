<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateTransactionDto;
use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

final readonly class CreateTransactionAction
{
    /**
     * Invoke the class instance.
     */
    public function handle(Account $account, CreateTransactionDto $data): void
    {
        DB::transaction(function () use ($account, $data): void {
            $account->transactions()->create([
                'user_id' => $account->user_id,
                'type' => $data->type,
                'amount' => $data->amount,
                'transaction_date' => $data->transaction_date,
                'description' => $data->description,
                'category_id' => $data->category_id,
                'running_balance' => 0,
            ]);

            UpdateAccountBalance::dispatch($account);
        });
    }
}
