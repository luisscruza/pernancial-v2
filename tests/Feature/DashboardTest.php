<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get('/')->assertRedirect('/auth');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()
        ->has(Currency::factory()->count(2))
        ->has(Account::factory()->count(2))
        ->has(Category::factory()->count(2))
        ->create());

    $this->get('/')->assertOk();
});

it('redirects to the onboarding page if the user has no accounts', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/')->assertRedirect('/onboarding');
});

it('redirects to the onboarding page if the user has no categories', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/')->assertRedirect('/onboarding');
});
