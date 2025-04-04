<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;

test('to array', function () {
    $user = User::factory()->create()->refresh();

    expect(array_keys($user->toArray()))
        ->toBe([
            'id',
            'name',
            'email',
            'email_verified_at',
            'google_id',
            'base_currency_id',
            'created_at',
            'updated_at',
        ]);
});

test('user belongs to base currency', function () {
    $currency = Currency::factory()->create();
    $user = User::factory()->create(['base_currency_id' => $currency->id]);

    expect($user->currency)->toBeInstanceOf(Currency::class)
        ->and($user->currency->id)->toBe($currency->id);
});

test('user has many accounts', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    expect($user->accounts)->toHaveCount(1)
        ->and($user->accounts->first())->toBeInstanceOf(Account::class);
});

test('user has correct casts', function () {
    $user = new User();
    $casts = $user->casts();

    expect($casts)
        ->toHaveKey('email_verified_at', 'datetime')
        ->toHaveKey('password', 'hashed');
});

it('has many categories', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    expect($user->categories)->toHaveCount(1)
        ->and($user->categories->first()->id)->toBe($category->id);
});

it('has many currencies', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->create(['user_id' => $user->id]);

    expect($user->currencies)->toHaveCount(1)
        ->and($user->currencies->first()->id)->toBe($currency->id);
});
