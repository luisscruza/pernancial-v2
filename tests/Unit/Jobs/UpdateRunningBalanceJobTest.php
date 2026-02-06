<?php

declare(strict_types=1);

use App\Enums\TransactionType;
use App\Jobs\UpdateRunningBalanceJob;
use App\Models\Account;
use App\Models\Currency;
use App\Models\Transaction;
use App\Models\User;

it('recomputes running balances after inserting a backdated transaction', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create(['balance' => 0]);

    Transaction::factory()->for($account)->create([
        'type' => TransactionType::INITIAL->value,
        'amount' => 100.00,
        'transaction_date' => '2025-01-02',
    ]);

    Transaction::factory()->for($account)->create([
        'type' => TransactionType::INCOME->value,
        'amount' => 50.00,
        'transaction_date' => '2025-01-05',
    ]);

    Transaction::factory()->for($account)->create([
        'type' => TransactionType::EXPENSE->value,
        'amount' => 20.00,
        'transaction_date' => '2025-01-06',
    ]);

    Transaction::factory()->for($account)->create([
        'type' => TransactionType::INCOME->value,
        'amount' => 10.00,
        'transaction_date' => '2025-01-03',
    ]);

    UpdateRunningBalanceJob::dispatchSync($account);

    $balances = $account->transactions()
        ->orderBy('transaction_date')
        ->orderBy('id')
        ->pluck('running_balance')
        ->toArray();

    expect($balances)->toBe([
        100.0,
        110.0,
        160.0,
        140.0,
    ]);
});
