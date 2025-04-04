<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Currency;
use App\Models\User;

test('to array', function () {
    $account = Account::factory()->create()->fresh();

    expect(array_keys($account->toArray()))->toBe([
        'id',
        'user_id',
        'currency_id',
        'name',
        'emoji',
        'color',
        'type',
        'balance',
        'description',
        'created_at',
        'updated_at',
    ]);
});

test('account belongs to user', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    expect($account->user)->toBeInstanceOf(User::class)
        ->and($account->user->id)->toBe($user->id);
});

test('account belongs to currency', function () {
    $currency = Currency::factory()->create();
    $account = Account::factory()->create(['currency_id' => $currency->id]);

    expect($account->currency)->toBeInstanceOf(Currency::class)
        ->and($account->currency->id)->toBe($currency->id);
});
