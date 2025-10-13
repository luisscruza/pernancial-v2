<?php

declare(strict_types=1);

use App\Enums\CategoryType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('user can visit categories page', function () {
    $user = User::factory()
        ->has(Category::factory()->count(3))
        ->has(Currency::factory()->count(1))
        ->create();

    Account::factory()->for($user)->for($user->currencies->first())->create();

    $response = $this->actingAs($user)->get(route('categories'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/index')
            ->has('categories', 3)
        );
});

test('categories are ordered by type then name', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    // Create categories in mixed order
    Category::factory()->for($user)->create(['name' => 'Z Category', 'type' => 'income']);
    Category::factory()->for($user)->create(['name' => 'A Category', 'type' => 'expense']);
    Category::factory()->for($user)->create(['name' => 'B Category', 'type' => 'income']);
    Category::factory()->for($user)->create(['name' => 'C Category', 'type' => 'expense']);

    $response = $this->actingAs($user)->get(route('categories'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('categories/index')
        ->has('categories', 4)
        ->where('categories.0.name', 'A Category') // expense first
        ->where('categories.0.type', 'expense')
        ->where('categories.1.name', 'C Category') // expense second
        ->where('categories.1.type', 'expense')
        ->where('categories.2.name', 'B Category') // income first
        ->where('categories.2.type', 'income')
        ->where('categories.3.name', 'Z Category') // income second
        ->where('categories.3.type', 'income')
    );
});

test('user can view category creation page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->get(route('categories.create'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/create')
        );
});

test('user can create an expense category', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Supermercado',
        'emoji' => '🛒',
        'type' => 'expense',
    ];

    $response = $this->actingAs($user)->post(route('categories.store'), $data);

    $response->assertRedirect(route('categories'))
        ->assertSessionHas('success', 'Categoría creada exitosamente.');

    $user = $user->fresh();
    expect($user->categories()->count())->toBe(1);

    $category = $user->categories()->first();
    expect($category)->not()->toBeNull()
        ->and($category->name)->toBe('Supermercado')
        ->and($category->emoji)->toBe('🛒')
        ->and($category->type)->toBe(CategoryType::EXPENSE);
});

test('user can create an income category', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Salario',
        'emoji' => '💰',
        'type' => 'income',
    ];

    $response = $this->actingAs($user)->post(route('categories.store'), $data);

    $response->assertRedirect(route('categories'))
        ->assertSessionHas('success', 'Categoría creada exitosamente.');

    $category = $user->categories()->first();
    expect($category)->not()->toBeNull()
        ->and($category->name)->toBe('Salario')
        ->and($category->emoji)->toBe('💰')
        ->and($category->type)->toBe(CategoryType::INCOME);
});

test('category creation validates required fields', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->postJson(route('categories.store'), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'emoji', 'type']);
});

test('category creation validates name max length', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => str_repeat('a', 256), // 256 characters
        'emoji' => '🛒',
        'type' => 'expense',
    ];

    $response = $this->actingAs($user)->postJson(route('categories.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

test('category creation validates emoji max length', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Category',
        'emoji' => str_repeat('🛒', 256), // 256 characters
        'type' => 'expense',
    ];

    $response = $this->actingAs($user)->postJson(route('categories.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['emoji']);
});

test('category creation validates type enum', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $data = [
        'name' => 'Test Category',
        'emoji' => '🛒',
        'type' => 'invalid-type',
    ];

    $response = $this->actingAs($user)->postJson(route('categories.store'), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

test('category creation shows Spanish error messages', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $response = $this->actingAs($user)->postJson(route('categories.store'), []);

    $response->assertUnprocessable();

    $errors = $response->json('errors');
    expect($errors['name'][0])->toBe('El nombre de la categoría es obligatorio.');
    expect($errors['emoji'][0])->toBe('El emoji es obligatorio.');
    expect($errors['type'][0])->toBe('El tipo de categoría es obligatorio.');
});

test('user cannot access categories without being authenticated', function () {
    $response = $this->get(route('categories'));
    $response->assertRedirect(route('auth'));

    $response = $this->get(route('categories.create'));
    $response->assertRedirect(route('auth'));

    $response = $this->post(route('categories.store'), []);
    $response->assertRedirect(route('auth'));
});

test('user cannot access categories without passing onboarding', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('categories'));
    $response->assertRedirect();

    $response = $this->actingAs($user)->get(route('categories.create'));
    $response->assertRedirect();

    $response = $this->actingAs($user)->post(route('categories.store'), []);
    $response->assertRedirect();
});

test('user can only see their own categories', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $currency1 = Currency::factory()->for($user1)->create();
    $currency2 = Currency::factory()->for($user2)->create();

    Account::factory()->for($user1)->for($currency1)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    // Create categories for both users
    Category::factory()->for($user1)->create(['name' => 'User 1 Category']);
    Category::factory()->for($user2)->create(['name' => 'User 2 Category']);

    $response = $this->actingAs($user1)->get(route('categories'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('categories/index')
        ->has('categories', 1)
        ->where('categories.0.name', 'User 1 Category')
    );
});

test('categories display shows correct fields', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    Account::factory()->for($user)->for($currency)->create();

    $category = Category::factory()->for($user)->create([
        'name' => 'Groceries',
        'emoji' => '🛒',
        'type' => 'expense',
    ]);

    $response = $this->actingAs($user)->get(route('categories'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('categories/index')
        ->has('categories', 1)
        ->where('categories.0.id', $category->id)
        ->where('categories.0.name', 'Groceries')
        ->where('categories.0.emoji', '🛒')
        ->where('categories.0.type', 'expense')
        ->missing('categories.0.created_at') // Should not include timestamps
        ->missing('categories.0.updated_at')
        ->missing('categories.0.user_id') // Should not include user_id
    );
});

test('user can view category detail page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('categories.show', $category));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/show')
            ->has('category')
            ->where('category.id', $category->id)
            ->where('category.name', $category->name)
            ->where('category.emoji', $category->emoji)
            ->where('category.type', $category->type)
            ->has('transactions')
        );
});

test('user can view category edit page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->get(route('categories.edit', $category));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/edit')
            ->has('category')
            ->where('category.id', $category->id)
            ->where('category.name', $category->name)
            ->where('category.emoji', $category->emoji)
            ->where('category.type', $category->type)
        );
});

test('user can update a category', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create([
        'name' => 'Old Name',
        'emoji' => '🛒',
        'type' => 'expense',
    ]);

    $data = [
        'name' => 'Updated Category Name',
        'emoji' => '🎯',
        'type' => 'income',
    ];

    $response = $this->actingAs($user)->put(route('categories.update', $category), $data);

    $response->assertRedirect(route('categories.show', $category))
        ->assertSessionHas('success', 'Categoría actualizada exitosamente.');

    $category = $category->fresh();
    expect($category->name)->toBe('Updated Category Name')
        ->and($category->emoji)->toBe('🎯')
        ->and($category->type)->toBe(CategoryType::INCOME);
});

test('category update validates required fields', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $response = $this->actingAs($user)->putJson(route('categories.update', $category), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'emoji', 'type']);
});

test('user cannot view other users category', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $currency1 = Currency::factory()->for($user1)->create();
    $currency2 = Currency::factory()->for($user2)->create();

    Account::factory()->for($user1)->for($currency1)->create();
    Account::factory()->for($user2)->for($currency2)->create();

    $category = Category::factory()->for($user2)->create();

    $response = $this->actingAs($user1)->get(route('categories.show', $category));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->get(route('categories.edit', $category));
    $response->assertNotFound();

    $response = $this->actingAs($user1)->put(route('categories.update', $category), [
        'name' => 'Hacked',
        'emoji' => '🚨',
        'type' => 'expense',
    ]);
    $response->assertNotFound();
});

test('category shows related transactions', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();

    $transaction1 = App\Models\Transaction::factory()->for($account)->for($category)->create([
        'transaction_date' => now()->subDay(),
    ]);
    $transaction2 = App\Models\Transaction::factory()->for($account)->for($category)->create([
        'transaction_date' => now(),
    ]);

    $otherCategory = Category::factory()->for($user)->create();
    App\Models\Transaction::factory()->for($account)->for($otherCategory)->create();

    $response = $this->actingAs($user)->get(route('categories.show', $category));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('categories/show')
        ->has('transactions.data', 2)
        ->where('transactions.data.0.id', $transaction2->id)
        ->where('transactions.data.1.id', $transaction1->id)
    );
});
