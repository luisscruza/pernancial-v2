<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Currency;
use App\Models\CurrencyRate;
use App\Models\User;

test('user can add currency rate', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'conversion_rate' => 1.0,
    ]);
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 1.25,
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user)->post(route('currencies.rates.store', $currency), $data);

    $response->assertRedirect(route('currencies.edit', $currency))
        ->assertSessionHas('flash.type', 'success')
        ->assertSessionHas('flash.message', 'Tasa de conversión agregada exitosamente.');

    // Check that rate was created
    expect($currency->rates()->count())->toBe(1);

    $rate = $currency->rates()->first();
    expect($rate->rate)->toBe(1.25)
        ->and($rate->effective_date)->toBe('2024-07-13')
        ->and($rate->currency_id)->toBe($currency->id);
});

test('adding most recent rate updates currency conversion rate', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'conversion_rate' => 1.0,
    ]);
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    // Add an older rate
    CurrencyRate::factory()->for($currency)->create([
        'rate' => 1.10,
        'effective_date' => '2024-06-01',
    ]);

    // Add a newer rate
    $data = [
        'rate' => 1.25,
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user)->post(route('currencies.rates.store', $currency), $data);

    $response->assertRedirect(route('currencies.edit', $currency));

    // Currency conversion rate should be updated to the newest rate
    $currency = $currency->fresh();
    expect((float) $currency->conversion_rate)->toBe(1.2500000000);
});

test('currency rate creation validates required fields', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->postJson(route('currencies.rates.store', $currency), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['rate', 'effective_date']);
});

test('currency rate creation validates rate is numeric and positive', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 'not-numeric',
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.rates.store', $currency), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['rate']);

    // Test negative rate
    $data = [
        'rate' => -1.0,
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.rates.store', $currency), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['rate']);

    // Test zero rate
    $data = [
        'rate' => 0,
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.rates.store', $currency), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['rate']);
});

test('currency rate creation validates rate minimum value', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 0.0000001, // Too small
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.rates.store', $currency), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['rate']);
});

test('currency rate creation validates effective date format', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 1.25,
        'effective_date' => 'invalid-date',
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.rates.store', $currency), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['effective_date']);
});

test('currency rate creation validates effective date is not future', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 1.25,
        'effective_date' => now()->addDay()->toDateString(), // Future date
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.rates.store', $currency), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['effective_date']);
});

test('currency rate creation allows today date', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 1.25,
        'effective_date' => now()->toDateString(), // Today
    ];

    $response = $this->actingAs($user)->post(route('currencies.rates.store', $currency), $data);

    $response->assertRedirect(route('currencies.edit', $currency));

    expect($currency->rates()->count())->toBe(1);
});

test('currency rate creation allows past dates', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 1.25,
        'effective_date' => now()->subDays(30)->toDateString(), // Past date
    ];

    $response = $this->actingAs($user)->post(route('currencies.rates.store', $currency), $data);

    $response->assertRedirect(route('currencies.edit', $currency));

    expect($currency->rates()->count())->toBe(1);
});

test('user can add multiple rates for same currency', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    // Add first rate
    $data1 = [
        'rate' => 1.10,
        'effective_date' => '2024-06-01',
    ];
    $response1 = $this->actingAs($user)->post(route('currencies.rates.store', $currency), $data1);
    $response1->assertRedirect(route('currencies.edit', $currency));

    // Add second rate
    $data2 = [
        'rate' => 1.25,
        'effective_date' => '2024-07-13',
    ];
    $response2 = $this->actingAs($user)->post(route('currencies.rates.store', $currency), $data2);
    $response2->assertRedirect(route('currencies.edit', $currency));

    expect($currency->rates()->count())->toBe(2);

    $rates = $currency->rates()->orderBy('effective_date', 'desc')->get();
    expect($rates->first()->rate)->toBe(1.25)
        ->and($rates->last()->rate)->toBe(1.10);
});

test('user can add rate with very precise decimal', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'rate' => 1.234567, // 6 decimal places
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user)->post(route('currencies.rates.store', $currency), $data);

    $response->assertRedirect(route('currencies.edit', $currency));

    $rate = $currency->rates()->first();
    expect($rate->rate)->toBe(1.234567);
});

test('unauthorized user cannot add rates to currency', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $currency = Currency::factory()->for($user1)->create();
    // User1 needs an account to pass onboarding middleware
    Account::factory()->for($user1)->for($currency)->create();
    // User2 also needs currency and account to pass onboarding middleware
    $currency2 = Currency::factory()->for($user2)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    $data = [
        'rate' => 1.25,
        'effective_date' => '2024-07-13',
    ];

    $response = $this->actingAs($user2)->post(route('currencies.rates.store', $currency), $data);

    $response->assertNotFound();

    expect($currency->rates()->count())->toBe(0);
});

test('user can only add rates to their own currencies', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $currency1 = Currency::factory()->for($user1)->create();
    $currency2 = Currency::factory()->for($user2)->create();
    // Both users need accounts to pass onboarding middleware
    Account::factory()->for($user1)->for($currency1)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    $data = [
        'rate' => 1.25,
        'effective_date' => '2024-07-13',
    ];

    // User 1 can add rate to their currency
    $response1 = $this->actingAs($user1)->post(route('currencies.rates.store', $currency1), $data);
    $response1->assertRedirect(route('currencies.edit', $currency1));
    expect($currency1->rates()->count())->toBe(1);

    // User 1 cannot add rate to user 2's currency
    $response2 = $this->actingAs($user1)->post(route('currencies.rates.store', $currency2), $data);
    $response2->assertNotFound();
    expect($currency2->rates()->count())->toBe(0);
});
