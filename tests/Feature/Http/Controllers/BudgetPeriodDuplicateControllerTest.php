<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;

test('user can view budget period duplicate page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create(['currency_id' => $currency->id]);

    Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create(['amount' => 50000]); // 500.00 in cents

    $response = $this->actingAs($user)->get(route('budget-periods.duplicate', $budgetPeriod));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('budgets/period-duplicate')
            ->has('originalPeriod', fn ($page) => $page
                ->where('id', $budgetPeriod->id)
                ->where('name', $budgetPeriod->name)
            )
            ->has('categories', 1)
            ->has('budgetData', fn ($page) => $page
                ->where((string) $category->id, fn ($page) => $page
                    ->where('amount', 500.00) // converted from cents
                    ->where('category_id', $category->id)
                )
            )
        );
});

test('budget period duplicate shows all budgets from original period', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $category1 = Category::factory()->for($user)->create(['name' => 'Category One']);
    $category2 = Category::factory()->for($user)->create(['name' => 'Category Two']);

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create(['currency_id' => $currency->id]);

    Budget::factory()
        ->for($budgetPeriod)
        ->for($category1)
        ->create(['amount' => 30000]); // 300.00 in cents

    Budget::factory()
        ->for($budgetPeriod)
        ->for($category2)
        ->create(['amount' => 75000]); // 750.00 in cents

    $response = $this->actingAs($user)->get(route('budget-periods.duplicate', $budgetPeriod));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('budgets/period-duplicate')
            ->has('originalPeriod')
            ->has('categories', 2)
            ->has('budgetData', 2)
            ->has('budgetData.'.$category1->id, fn ($page) => $page
                ->where('amount', 300.00)
                ->where('category_id', $category1->id)
            )
            ->has('budgetData.'.$category2->id, fn ($page) => $page
                ->where('amount', 750.00)
                ->where('category_id', $category2->id)
            )
        );
});

test('budget period duplicate loads categories ordered by name', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $categoryZ = Category::factory()->for($user)->create(['name' => 'Z Category']);
    $categoryA = Category::factory()->for($user)->create(['name' => 'A Category']);
    $categoryM = Category::factory()->for($user)->create(['name' => 'M Category']);

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create(['currency_id' => $currency->id]);

    $response = $this->actingAs($user)->get(route('budget-periods.duplicate', $budgetPeriod));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('categories', 3)
            ->has('categories.0', fn ($page) => $page
                ->where('name', 'A Category')
            )
            ->has('categories.1', fn ($page) => $page
                ->where('name', 'M Category')
            )
            ->has('categories.2', fn ($page) => $page
                ->where('name', 'Z Category')
            )
        );
});

test('budget period duplicate shows empty budget data when original has no budgets', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create(['currency_id' => $currency->id]);

    $response = $this->actingAs($user)->get(route('budget-periods.duplicate', $budgetPeriod));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('budgets/period-duplicate')
            ->has('originalPeriod')
            ->has('categories', 1)
            ->has('budgetData', 0) // No budget data
        );
});

test('user cannot duplicate other users budget periods', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $currency1 = Currency::factory()->for($user1)->create();
    $currency2 = Currency::factory()->for($user2)->create();

    Account::factory()->for($user1)->for($currency1)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    $budgetPeriod = BudgetPeriod::factory()->for($user2)->create(['currency_id' => $currency2->id]);

    $response = $this->actingAs($user1)->get(route('budget-periods.duplicate', $budgetPeriod));
    $response->assertForbidden();
});

test('user cannot access budget period duplicate without authentication', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create(['currency_id' => $currency->id]);

    $this->get(route('budget-periods.duplicate', $budgetPeriod))->assertRedirect();
});

test('user cannot access budget period duplicate without onboarding', function () {
    $user = User::factory()->create(); // No account = no onboarding completion
    $currency = Currency::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create(['currency_id' => $currency->id]);

    $this->actingAs($user)->get(route('budget-periods.duplicate', $budgetPeriod))->assertRedirect();
});
