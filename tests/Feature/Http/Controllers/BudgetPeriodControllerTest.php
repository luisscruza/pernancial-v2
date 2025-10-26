<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;

test('user can view budget periods index page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create();

    $response = $this->actingAs($user)->get(route('budgets.index'));

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('budgets/index')
                ->has('budgetPeriods')
        );
});

test('user can view budget period creation page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('budget-periods.create'));

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('budgets/period-create')
                ->has('categories')
        );
});

test('user can view budget period show page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create();

    Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $response = $this->actingAs($user)->get(route('budget-periods.show', $budgetPeriod));

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('budgets/period-show')
                ->has('budgetPeriod')
        );
});

test('user can view budget period edit page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create();

    $response = $this->actingAs($user)->get(route('budget-periods.edit', $budgetPeriod));

    $response->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('budgets/period-edit')
                ->has('budgetPeriod')
                ->has('categories')
        );
});

test('user can update a budget period', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create([
            'name' => 'Original Name',
        ]);

    $data = [
        'name' => 'Updated Budget Period',
        'start_date' => $budgetPeriod->start_date->toDateString(),
        'end_date' => $budgetPeriod->end_date->toDateString(),
        'budgets' => [
            $category->id => [
                'amount' => 750.00,
                'category_id' => $category->id,
            ],
        ],
    ];

    $response = $this->actingAs($user)->put(route('budget-periods.update', $budgetPeriod), $data);

    $response->assertRedirect();

    $budgetPeriod = $budgetPeriod->fresh();
    expect($budgetPeriod->name)->toBe('Updated Budget Period');
});

test('budget period creation validates required fields', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->postJson(route('budget-periods.store'), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'start_date', 'end_date']);
});

test('budget period creation validates date format', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Period',
        'start_date' => 'invalid-date',
        'end_date' => 'invalid-date',
        'budgets' => [],
    ];

    $response = $this->actingAs($user)->postJson(route('budget-periods.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['start_date', 'end_date']);
});

test('budget period creation validates end date is after start date', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Period',
        'start_date' => now()->addDays(10)->toDateString(),
        'end_date' => now()->toDateString(),
        'budgets' => [],
    ];

    $response = $this->actingAs($user)->postJson(route('budget-periods.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['end_date']);
});

test('user cannot access other users budget periods', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $currency1 = Currency::factory()->for($user1)->create();
    $currency2 = Currency::factory()->for($user2)->create();

    Account::factory()->for($user1)->for($currency1)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    $budgetPeriod = BudgetPeriod::factory()->for($user2)->create();

    $response = $this->actingAs($user1)->get(route('budget-periods.show', $budgetPeriod));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->get(route('budget-periods.edit', $budgetPeriod));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->put(route('budget-periods.update', $budgetPeriod), [
        'name' => 'Hacked Period',
        'start_date' => now()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
        'budgets' => [],
    ]);
    $response->assertNotFound();
});

test('user cannot access budget periods without authentication', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create();

    $this->get(route('budgets.index'))->assertRedirect();
    $this->get(route('budget-periods.create'))->assertRedirect();
    $this->post(route('budget-periods.store'), [])->assertRedirect();
    $this->get(route('budget-periods.show', $budgetPeriod))->assertRedirect();
    $this->get(route('budget-periods.edit', $budgetPeriod))->assertRedirect();
    $this->put(route('budget-periods.update', $budgetPeriod), [])->assertRedirect();
});
