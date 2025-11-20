<?php

declare(strict_types=1);

use App\Enums\BudgetType;
use App\Models\Account;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use App\Models\Category;
use App\Models\Currency;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('user can visit budgets index page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $budgetPeriod = BudgetPeriod::factory()->for($user)->create();
    Budget::factory()->for($user)->for($budgetPeriod)->create();

    $response = $this->actingAs($user)->get(route('budgets.index'));

    $response->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('budgets/index')
                ->has('budgetPeriods', 1)
                ->has('currentPeriod')
        );
});

test('user can view budget creation page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('budgets.create'));

    $response->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('budgets/create')
                ->has('categories', 1)
        );
});

test('user can create a budget', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $data = [
        'name' => 'Test Budget',
        'amount' => 1000,
        'type' => BudgetType::PERIOD->value,
        'period_type' => 'monthly',
        'category_id' => $category->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
        'description' => 'Test budget description',
    ];

    $response = $this->actingAs($user)->post(route('budgets.store'), $data);

    $response->assertRedirect()
        ->assertSessionHas('flash.type', 'success')
        ->assertSessionHas('flash.message', 'Presupuesto creado exitosamente.');

    $budget = $user->budgets()->first();
    expect($budget)->not()->toBeNull()
        ->and($budget->name)->toBe('Test Budget')
        ->and($budget->amount)->toBe('1000.00')
        ->and($budget->type)->toBe(BudgetType::PERIOD)
        ->and($budget->category_id)->toBe($category->id);
});

test('user can view budget show page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user)->create();
    $budget = Budget::factory()->for($user)->for($budgetPeriod)->create([
        'category_id' => $category->id,
    ]);

    Transaction::factory()->for($account)->for($category)->create([
        'transaction_date' => $budgetPeriod->start_date,
        'amount' => 100,
    ]);

    $response = $this->actingAs($user)->get(route('budgets.show', $budget));

    $response->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('budgets/show')
                ->has('budget')
                ->has('budgetSummary')
                ->has('transactions', 1)
        );
});

test('user can view budget edit page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user)->create();
    $budget = Budget::factory()->for($user)->for($budgetPeriod)->create([
        'category_id' => $category->id,
    ]);

    $response = $this->actingAs($user)->get(route('budgets.edit', $budget));

    $response->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('budgets/edit')
                ->has('budget')
                ->has('categories', 1)
        );
});

test('user can update a budget', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user)->create();
    $budget = Budget::factory()->for($user)->for($budgetPeriod)->create([
        'category_id' => $category->id,
        'name' => 'Original Budget',
        'amount' => 500,
    ]);

    $data = [
        'name' => 'Updated Budget',
        'amount' => 1500,
        'description' => 'Updated description',
        'category_id' => $category->id,
    ];

    $response = $this->actingAs($user)->put(route('budgets.update', $budget), $data);

    $response->assertRedirect(route('budgets.show', $budget))
        ->assertSessionHas('flash.type', 'success')
        ->assertSessionHas('flash.message', 'Presupuesto actualizado exitosamente.');

    $budget = $budget->fresh();
    expect($budget->name)->toBe('Updated Budget')
        ->and($budget->amount)->toBe('1500.00');
});

test('user can delete a budget', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user)->create();
    $budget = Budget::factory()->for($user)->for($budgetPeriod)->create([
        'category_id' => $category->id,
    ]);

    $response = $this->actingAs($user)->delete(route('budgets.destroy', $budget));

    $response->assertRedirect(route('budgets.index'))
        ->assertSessionHas('flash.type', 'success')
        ->assertSessionHas('flash.message', 'Presupuesto eliminado exitosamente.');

    expect($user->budgets()->count())->toBe(0);
});

test('budget creation validates required fields', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->postJson(route('budgets.store'), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'amount', 'type', 'category_id', 'start_date', 'end_date']);
});

test('budget update validates field formats', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user)->create();
    $budget = Budget::factory()->for($user)->for($budgetPeriod)->create([
        'category_id' => $category->id,
    ]);

    $response = $this->actingAs($user)->putJson(route('budgets.update', $budget), [
        'name' => str_repeat('a', 256), // Too long
        'amount' => -10, // Negative amount
        'category_id' => 999999, // Non-existent category
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'amount', 'category_id']);
});

test('user cannot access other users budgets', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $currency1 = Currency::factory()->for($user1)->create();
    $currency2 = Currency::factory()->for($user2)->create();

    Account::factory()->for($user1)->for($currency1)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    $category = Category::factory()->for($user2)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user2)->create();
    $budget = Budget::factory()->for($user2)->for($budgetPeriod)->create([
        'category_id' => $category->id,
    ]);

    $response = $this->actingAs($user1)->get(route('budgets.show', $budget));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->get(route('budgets.edit', $budget));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->put(route('budgets.update', $budget), [
        'name' => 'Hacked Budget',
        'amount' => 999,
        'category_id' => $category->id,
    ]);
    $response->assertNotFound();

    $response = $this->actingAs($user1)->delete(route('budgets.destroy', $budget));
    $response->assertNotFound();
});

test('user cannot access budgets without authentication', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $budgetPeriod = BudgetPeriod::factory()->for($user)->create();
    $budget = Budget::factory()->for($user)->for($budgetPeriod)->create([
        'category_id' => $category->id,
    ]);

    $this->get(route('budgets.index'))->assertRedirect(route('auth'));
    $this->get(route('budgets.create'))->assertRedirect(route('auth'));
    $this->post(route('budgets.store'), [])->assertRedirect(route('auth'));
    $this->get(route('budgets.show', $budget))->assertRedirect(route('auth'));
    $this->get(route('budgets.edit', $budget))->assertRedirect(route('auth'));
    $this->put(route('budgets.update', $budget), [])->assertRedirect(route('auth'));
    $this->delete(route('budgets.destroy', $budget))->assertRedirect(route('auth'));
});

test('user cannot access budgets without passing onboarding', function () {
    $user = User::factory()->create(); // No account = no onboarding completion

    $this->actingAs($user)->get(route('budgets.index'))->assertRedirect();
    $this->actingAs($user)->get(route('budgets.create'))->assertRedirect();
    $this->actingAs($user)->post(route('budgets.store'), [])->assertRedirect();
});
