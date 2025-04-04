<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Currency;
use App\Models\User;

test('to array', function () {
    $currency = Currency::factory()->create()->fresh();

    expect(array_keys($currency->toArray()))->toBe([
        'id',
        'user_id',
        'code',
        'name',
        'symbol',
        'decimal_places',
        'decimal_separator',
        'thousands_separator',
        'symbol_position',
        'conversion_rate',
        'is_base',
        'created_at',
        'updated_at',
    ]);
});

test('currency has many users', function () {
    $currency = Currency::factory()->create();
    $user = User::factory()->create(['base_currency_id' => $currency->id]);

    expect($currency->users)->toHaveCount(1)
        ->and($currency->users->first())->toBeInstanceOf(User::class);
});

test('currency has many accounts', function () {
    $currency = Currency::factory()->create();
    $account = Account::factory()->create(['currency_id' => $currency->id]);

    expect($currency->accounts)->toHaveCount(1)
        ->and($currency->accounts->first())->toBeInstanceOf(Account::class);
});
