<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;

test('to array', function () {
    $transaction = Transaction::factory()->create()->fresh();

    expect(array_keys($transaction->toArray()))->toBe([
        'id',
        'type',
        'amount',
        'transaction_date',
        'description',
        'account_id',
        'destination_account_id',
        'from_account_id',
        'category_id',
        'conversion_rate',
        'converted_amount',
        'running_balance',
        'created_at',
        'updated_at',
        'deleted_at',
        'related_transaction_id',
        'ai_assisted',
    ]);
});

test('transaction belongs to account', function () {
    $account = Account::factory()->create();
    $transaction = Transaction::factory()->create(['account_id' => $account->id]);

    expect($transaction->account)->toBeInstanceOf(Account::class);
});

test('transaction belongs to category', function () {
    $category = Category::factory()->create();
    $transaction = Transaction::factory()->create(['category_id' => $category->id]);

    expect($transaction->category)->toBeInstanceOf(Category::class);
});

test('transaction can belong to a destination account', function () {
    $account = Account::factory()->create();
    $transaction = Transaction::factory()->create(['destination_account_id' => $account->id]);

    expect($transaction->destinationAccount)->toBeInstanceOf(Account::class);
});
