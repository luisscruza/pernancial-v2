<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionSplit;

test('transaction split belongs to transaction', function () {
    $transaction = Transaction::factory()->create();
    $split = TransactionSplit::factory()->create(['transaction_id' => $transaction->id]);

    expect($split->transaction)->toBeInstanceOf(Transaction::class);
});

test('transaction split belongs to category', function () {
    $category = Category::factory()->create();
    $split = TransactionSplit::factory()->create(['category_id' => $category->id]);

    expect($split->category)->toBeInstanceOf(Category::class);
});
