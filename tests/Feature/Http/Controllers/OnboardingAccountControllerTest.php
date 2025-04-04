<?php

declare(strict_types=1);

namespace Tests\Feature\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;

test('users can view onboarding accounts if they have at least one category', function () {
    $user = User::factory()->create();

    $user->categories()->create([
        'name' => 'Test Category',
        'emoji' => '💰',
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.accounts'));

    expect($response->status())->toBe(200);
});

it('redirects to the categories onboarding page if the user has no categories', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('onboarding.accounts'));

    expect($response->status())->toBe(302);
});

test('user can create an account', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('onboarding.accounts'), [
        'name' => 'Test Account',
        'type' => 'bank',
        'balance' => 1000,
        'currency_id' => 'USD',
        'description' => 'Test Description',
    ]);

    expect($response->status())->toBe(302)
        ->and($user->accounts()->count())->toBe(1)
        ->and($user->accounts()->first()->name)->toBe('Test Account')
        ->and($user->accounts()->first()->type)->toBe('bank')
        ->and($user->accounts()->first()->balance)->toBe(1000)
        ->and($user->currencies()->first()->code)->toBe('USD')
        ->and($user->accounts()->first()->currency_id)->toBe($user->currencies()->first()->id)
        ->and($user->accounts()->first()->description)->toBe('Test Description')
        ->and($user->baseCurrency->id)->toBe($user->currencies()->first()->id)
        ->and($response->headers->get('Location'))->toBe(route('dashboard'));
});

it('redirects to the dashboard if the user has at least one account', function () {
    $user = User::factory()->create();

    Account::factory()->create([
        'user_id' => $user->id,
    ]);

    Category::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.accounts'));

    expect($response->status())->toBe(302)
        ->and($response->headers->get('Location'))->toBe(route('dashboard'));
});
