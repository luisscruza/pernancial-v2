<?php

declare(strict_types=1);

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

test('to array', function () {
    $account = Account::factory()->create()->fresh();

    expect(array_keys($account->toArray()))->toBe([
        'id',
        'uuid',
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
        'is_active',
        'accounting_type',
        'balance_in_base',
        'currency',
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

test('account global scope is applied', function () {
    $user = User::factory()->create();

    Auth::login($user);

    $type = AccountType::GENERAL;

    $account = Account::create([
        'name' => 'Test Account',
        'currency_id' => Currency::factory()->create()->id,
        'description' => 'This is a test account',
        'balance' => 0,
        'type' => $type,
        'emoji' => $type->emoji(),
        'color' => $type->color(),
    ]);

    expect($account->user_id)->toBe($user->id);
});
