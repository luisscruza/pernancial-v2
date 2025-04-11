<?php

declare(strict_types=1);

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

    $user = User::factory()->has(Account::factory()->count(1))
        ->has(Currency::factory()->count(2))
        ->has(Category::factory()->count(2))->create();

    $account = $user->accounts()->first();

    $transaction = Transaction::factory()->for($account)->create();

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
