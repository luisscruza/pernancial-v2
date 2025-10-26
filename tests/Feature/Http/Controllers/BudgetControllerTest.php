<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use App\Models\Category;
use App\Models\User;

test('user can view budget show page', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create();

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $response = $this->actingAs($user)->get(route('budgets.show', $budget));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('budgets/show')
            ->has('budget')
        );
});

test('user can view budget edit page', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create();

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $response = $this->actingAs($user)->get(route('budgets.edit', $budget));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('budgets/edit')
            ->has('budget')
            ->has('categories')
        );
});

test('user can update a budget', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user)
        ->create();

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create(['amount' => 50000]); // 500.00 in cents

    $data = [
        'category_id' => $category->id,
        'amount' => 750.00,
    ];

    $response = $this->actingAs($user)->put(route('budgets.update', $budget), $data);

    $response->assertRedirect();

    $this->assertDatabaseHas('budgets', [
        'id' => $budget->id,
        'category_id' => $category->id,
        'amount' => 75000, // 750.00 in cents
    ]);
});

test('user can delete a budget', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user);

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $response = $this->actingAs($user)->delete(route('budgets.destroy', $budget));

    $response->assertRedirect();

    $this->assertDatabaseMissing('budgets', [
        'id' => $budget->id,
    ]);
});

test('budget update validates required fields', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user);

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $response = $this->actingAs($user)->putJson(route('budgets.update', $budget), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['category_id', 'amount']);
});

test('budget update validates amount is numeric', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user);

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $data = [
        'category_id' => $category->id,
        'amount' => 'invalid',
    ];

    $response = $this->actingAs($user)->putJson(route('budgets.update', $budget), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['amount']);
});

test('budget update validates amount is positive', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user);

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $data = [
        'category_id' => $category->id,
        'amount' => -100,
    ];

    $response = $this->actingAs($user)->putJson(route('budgets.update', $budget), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['amount']);
});

test('user cannot access other users budgets', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    Account::factory()->for($user1)->create();
    Account::factory()->for($user2)->create();

    $category = Category::factory()->for($user2)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user2)->create();
    $budget = Budget::factory()->for($budgetPeriod)->for($category)->create();

    $response = $this->actingAs($user1)->get(route('budgets.show', $budget));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->get(route('budgets.edit', $budget));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->put(route('budgets.update', $budget), [
        'category_id' => $category->id,
        'amount' => 999,
    ]);
    $response->assertNotFound();

    $response = $this->actingAs($user1)->delete(route('budgets.destroy', $budget));
    $response->assertNotFound();
});

test('user cannot access budgets without authentication', function () {
    $user = User::factory()->create();
    Account::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();

    $budgetPeriod = BudgetPeriod::factory()
        ->for($user);

    $budget = Budget::factory()
        ->for($budgetPeriod)
        ->for($category)
        ->create();

    $this->get(route('budgets.show', $budget))->assertRedirect();
    $this->get(route('budgets.edit', $budget))->assertRedirect();
    $this->put(route('budgets.update', $budget), [])->assertRedirect();
    $this->delete(route('budgets.destroy', $budget))->assertRedirect();
});
