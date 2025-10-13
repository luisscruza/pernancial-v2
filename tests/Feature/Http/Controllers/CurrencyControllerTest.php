<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Currency;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('user can visit currencies page', function () {
    $user = User::factory()->create();
    $currencies = Currency::factory()->for($user)->count(3)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currencies->first())->create();

    $response = $this->actingAs($user)->get(route('currencies.index'));

    expect($response->status())->toBe(200);
});

test('user can visit currency show page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->get(route('currencies.show', $currency));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('currencies/show')
        ->has('currency', fn (Assert $page) => $page
            ->where('id', $currency->id)
            ->where('code', $currency->code)
            ->where('name', $currency->name)
            ->where('symbol', $currency->symbol)
            ->where('conversion_rate', $currency->conversion_rate)
            ->where('is_base', $currency->is_base)
            ->etc()
        )
    );
});

test('user can view currency creation page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->get(route('currencies.create'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('currencies/create')
        );
});

test('user can create a currency', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => 'USD',
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 1.0,
    ];

    $response = $this->actingAs($user)->post(route('currencies.store'), $data);

    $response->assertRedirect(route('currencies.index'))
        ->assertSessionHas('flash.type', 'success')
        ->assertSessionHas('flash.message', 'Moneda creada exitosamente.');

    $user = $user->fresh();
    expect($user->currencies()->count())->toBe(2); // Now has 2 currencies (existing + new)

    $currency = $user->currencies()->where('code', 'USD')->first();
    expect($currency->code)->toBe('USD')
        ->and($currency->name)->toBe('US Dollar')
        ->and($currency->symbol)->toBe('$')
        ->and($currency->decimal_places)->toBe(2)
        ->and($currency->decimal_separator)->toBe('.')
        ->and($currency->thousands_separator)->toBe(',')
        ->and($currency->symbol_position)->toBe('before')
        ->and((float) $currency->conversion_rate)->toBe(1.0);
});

test('user can create currency with custom formatting', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => 'EUR',
        'name' => 'Euro',
        'symbol' => '€',
        'decimal_places' => 2,
        'decimal_separator' => ',',
        'thousands_separator' => '.',
        'symbol_position' => 'after',
        'conversion_rate' => 0.85,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->post(route('currencies.store'), $data);

    $response->assertRedirect(route('currencies.index'));

    $currency = $user->currencies()->where('code', 'EUR')->first();
    expect($currency)->not()->toBeNull()
        ->and($currency->decimal_separator)->toBe(',')
        ->and($currency->thousands_separator)->toBe('.')
        ->and($currency->symbol_position)->toBe('after')
        ->and((float) $currency->conversion_rate)->toBe(0.85)
        ->and($currency->is_base)->toBe(false);
});

test('user can view currency edit page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->get(route('currencies.edit', $currency));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('currencies/edit')
            ->has('currency', fn (Assert $page) => $page
                ->where('id', $currency->id)
                ->where('code', $currency->code)
                ->where('name', $currency->name)
                ->where('symbol', $currency->symbol)
                ->where('user_id', $user->id)
                ->where('decimal_places', $currency->decimal_places)
                ->where('decimal_separator', $currency->decimal_separator)
                ->where('thousands_separator', $currency->thousands_separator)
                ->where('symbol_position', $currency->symbol_position)
                ->etc()
            )
        );
});

test('user can update a currency', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'code' => 'OLD',
        'name' => 'Old Currency',
        'conversion_rate' => 1.0,
    ]);
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'code' => 'NEW',
        'name' => 'New Currency',
        'symbol' => '₦',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 2.0,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->put(route('currencies.update', $currency), $data);

    $response->assertRedirect(route('currencies.show', $currency))
        ->assertSessionHas('flash.type', 'success')
        ->assertSessionHas('flash.message', 'Moneda actualizada exitosamente.');

    $currency = $currency->fresh();
    expect($currency->code)->toBe('NEW')
        ->and($currency->name)->toBe('New Currency')
        ->and($currency->symbol)->toBe('₦')
        ->and((float) $currency->conversion_rate)->toBe(2.0);

    // Should create new currency rate when rate changes
    expect($currency->rates()->count())->toBe(1);
    $rate = $currency->rates()->first();
    expect((float) $rate->rate)->toBe(2.0);
});

test('currency creation validates required fields', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $response = $this->actingAs($user)->postJson(route('currencies.store'), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors([
            'code', 'name', 'symbol', 'decimal_places',
            'decimal_separator', 'thousands_separator',
            'symbol_position', 'conversion_rate',
        ]);
});

test('currency creation validates code uniqueness per user', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();
    $existingCurrency = Currency::factory()->for($user)->create(['code' => 'USD']);
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => 'USD', // Duplicate code
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 1.0,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

test('currency creation validates code is alphabetic', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => 'US1', // Contains number
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 1.0,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

test('currency creation validates decimal places range', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => 'USD',
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 9, // Too many decimal places
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 1.0,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['decimal_places']);
});

test('currency creation validates symbol position', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => 'USD',
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'invalid', // Invalid position
        'conversion_rate' => 1.0,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['symbol_position']);
});

test('currency creation validates conversion rate minimum', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => 'USD',
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 0, // Too low
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['conversion_rate']);
});

test('currency creation validates field lengths', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();

    $data = [
        'code' => str_repeat('A', 11), // Too long
        'name' => str_repeat('A', 256), // Too long
        'symbol' => str_repeat('$', 11), // Too long
        'decimal_places' => 2,
        'decimal_separator' => str_repeat('.', 6), // Too long
        'thousands_separator' => str_repeat(',', 6), // Too long
        'symbol_position' => 'before',
        'conversion_rate' => 1.0,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->postJson(route('currencies.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors([
            'code', 'name', 'symbol', 'decimal_separator', 'thousands_separator',
        ]);
});

test('currency update validates unique code ignoring current currency', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();
    $currency1 = Currency::factory()->for($user)->create(['code' => 'USD']);
    $currency2 = Currency::factory()->for($user)->create(['code' => 'EUR']);

    $data = [
        'code' => 'EUR', // Same as current currency
        'name' => 'Euro Updated',
        'symbol' => '€',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'after',
        'conversion_rate' => 0.85,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->put(route('currencies.update', $currency2), $data);

    $response->assertRedirect(route('currencies.show', $currency2));

    $currency2 = $currency2->fresh();
    expect($currency2->name)->toBe('Euro Updated');
});

test('currency update validates unique code against other currencies', function () {
    $user = User::factory()->create();
    $existingCurrency = Currency::factory()->for($user)->create();
    // User needs an account to pass onboarding middleware
    Account::factory()->for($user)->for($existingCurrency)->create();
    $currency1 = Currency::factory()->for($user)->create(['code' => 'USD']);
    $currency2 = Currency::factory()->for($user)->create(['code' => 'EUR']);

    $data = [
        'code' => 'USD', // Already exists for another currency
        'name' => 'Euro Updated',
        'symbol' => '€',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'after',
        'conversion_rate' => 0.85,
        'is_base' => false,
    ];

    $response = $this->actingAs($user)->putJson(route('currencies.update', $currency2), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

test('different users can have currencies with same code', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $currency1 = Currency::factory()->for($user1)->create(['code' => 'USD']);
    $currency2 = Currency::factory()->for($user2)->create(['code' => 'EUR']); // Different initial currency
    // Both users need accounts to pass onboarding middleware
    Account::factory()->for($user1)->for($currency1)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    $data = [
        'code' => 'USD', // Same code but different user
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 1.0,
        'is_base' => false,
    ];

    $response = $this->actingAs($user2)->post(route('currencies.store'), $data);

    $response->assertRedirect(route('currencies.index'));

    expect($user2->currencies()->where('code', 'USD')->exists())->toBe(true);
});
