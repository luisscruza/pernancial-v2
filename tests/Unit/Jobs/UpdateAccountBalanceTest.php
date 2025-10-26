<?php

declare(strict_types=1);

use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use App\Models\Currency;
use App\Models\Transaction;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->currency = Currency::factory()->for($this->user)->create();
    $this->account = Account::factory()->for($this->user)->for($this->currency)->create();
});

it('correctly updates running balances for mixed transaction types', function () {
    $transactions = [
        ['type' => TransactionType::INITIAL->value, 'amount' => 100.00, 'transaction_date' => '2025-01-01'],
        ['type' => TransactionType::INCOME->value,  'amount' => 50.00,  'transaction_date' => '2025-01-02'],
        ['type' => TransactionType::EXPENSE->value, 'amount' => 30.00,  'transaction_date' => '2025-01-03'],
        ['type' => TransactionType::TRANSFER_IN->value, 'amount' => 20.00, 'transaction_date' => '2025-01-04'],
        ['type' => TransactionType::TRANSFER_OUT->value, 'amount' => 10.5, 'transaction_date' => '2025-01-05'],
    ];

    foreach ($transactions as $data) {
        Transaction::factory()
            ->for($this->account)
            ->create($data);
    }

    UpdateAccountBalance::dispatchSync($this->account, null);

    $balances = $this->account->transactions()->orderBy('transaction_date')->pluck('running_balance')->toArray();

    expect($balances)->toBe([
        100.0, // initial +100
        150.0, // income +50
        120.0, // expense -30
        140.0, // transfer_in +20
        129.5, // transfer_out -10.5
    ]);
});
