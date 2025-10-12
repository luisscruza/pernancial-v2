<?php

declare(strict_types=1);

use App\Enums\AccountType;
use App\Http\Resources\CurrencyResource;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('user can visit accounts page', function () {

    $user = User::factory()->has(Account::factory()->count(2))
        ->has(Currency::factory()->count(2))
        ->has(Category::factory()->count(2))->create();

    $response = $this->actingAs($user)->get(route('accounts'));

    expect($response->status())->toBe(200);
});

test('user can visit account page', function () {

    $user = User::factory()->create();

    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();

    Transaction::factory()->for($account)->create();

    $this->actingAs($user)->get(route('accounts.show', $account))
        ->assertInertia(fn (Assert $page) => $page
            ->component('accounts/show')
            ->has('account', fn (Assert $page) => $page
                ->where('id', $account->id)
                ->where('name', $account->name)
                ->where('type', $account->type->label())
                ->where('emoji', $account->emoji)
                ->where('color', $account->color)
                ->where('balance', $account->balance)
                ->where('currency', CurrencyResource::make($account->currency)->resolve())
                ->where('description', $account->description)
            )
            ->has('transactions', fn (Assert $page) => $page
                ->has('data', fn (Assert $page) => $page
                    ->where('0', $account->transactions()->with('category')->first()->toArray())
                )
                ->hasAll([
                    'current_page',
                    'first_page_url',
                    'from',
                    'last_page',
                    'last_page_url',
                    'links',
                    'next_page_url',
                    'path',
                    'per_page',
                    'prev_page_url',
                    'to',
                    'total',
                ])
            )
        );
});

test('user can view account creation page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->get(route('accounts.create'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('accounts/create')
            ->has('currencies', 1)
            ->has('accountTypes')
        );
});

test('user can create an account', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an existing account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Savings Account',
        'description' => 'My test savings account',
        'balance' => 1000,
        'currency_id' => $currency->id,
        'type' => AccountType::SAVINGS->value,
    ];

    $response = $this->actingAs($user)->post(route('accounts.store'), $data);

    $response->assertRedirect(route('accounts'))
        ->assertSessionHas('success', 'Cuenta creada exitosamente.');

    $user = $user->fresh();
    expect($user->accounts()->count())->toBe(2); // Original + new account

    $newAccount = $user->accounts()->where('name', 'Test Savings Account')->first();
    expect($newAccount)->not()->toBeNull()
        ->and($newAccount->name)->toBe('Test Savings Account')
        ->and($newAccount->description)->toBe('My test savings account')
        ->and($newAccount->type)->toBe(AccountType::SAVINGS)
        ->and($newAccount->currency_id)->toBe($currency->id);
});
test('user can create account with negative balance', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Credit Card',
        'description' => 'My credit card debt',
        'balance' => -500,
        'currency_id' => $currency->id,
        'type' => AccountType::CREDIT_CARD->value,
    ];

    $response = $this->actingAs($user)->post(route('accounts.store'), $data);

    $response->assertRedirect(route('accounts'));

    $account = $user->accounts()->where('name', 'Credit Card')->first();
    expect($account)->not()->toBeNull()
        ->and($account->balance)->toBe(-500);
});

test('user can create account with zero balance', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'New Checking Account',
        'balance' => 0,
        'currency_id' => $currency->id,
        'type' => AccountType::CHECKING->value,
    ];

    $response = $this->actingAs($user)->post(route('accounts.store'), $data);

    $response->assertRedirect(route('accounts'));

    $account = $user->accounts()->where('name', 'New Checking Account')->first();
    expect($account)->not()->toBeNull()
        ->and($account->balance)->toBe(0);
});

test('account creation validates required fields', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->postJson(route('accounts.store'), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'balance', 'currency_id', 'type']);
});

test('account creation validates name max length', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => str_repeat('a', 256), // 256 characters
        'balance' => 100,
        'currency_id' => $currency->id,
        'type' => AccountType::SAVINGS->value,
    ];

    $response = $this->actingAs($user)->postJson(route('accounts.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

test('account creation validates balance is numeric', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Account',
        'balance' => 'not-numeric',
        'currency_id' => $currency->id,
        'type' => AccountType::SAVINGS->value,
    ];

    $response = $this->actingAs($user)->postJson(route('accounts.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['balance']);
});

test('account creation validates currency exists', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Account',
        'balance' => 100,
        'currency_id' => 99999,
        'type' => AccountType::SAVINGS->value,
    ];

    $response = $this->actingAs($user)->postJson(route('accounts.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['currency_id']);
});

test('account creation validates account type enum', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Account',
        'balance' => 100,
        'currency_id' => $currency->id,
        'type' => 'invalid-type',
    ];

    $response = $this->actingAs($user)->postJson(route('accounts.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

test('account creation validates description max length', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Account',
        'description' => str_repeat('a', 256),
        'balance' => 100,
        'currency_id' => $currency->id,
        'type' => AccountType::SAVINGS->value,
    ];

    $response = $this->actingAs($user)->postJson(route('accounts.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['description']);
});
