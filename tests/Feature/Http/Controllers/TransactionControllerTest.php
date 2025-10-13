<?php

declare(strict_types=1);

use App\Actions\CreateTransactionAction;
use App\Dto\CreateTransactionDto;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->currency = Currency::factory()->for($this->user)->create();
    $this->account = Account::factory()->for($this->user)->for($this->currency)->create();
    $this->category = Category::factory()->for($this->user)->create(['type' => CategoryType::EXPENSE]);
});

test('user can create an income transaction', function () {
    $incomeCategory = Category::factory()->for($this->user)->create(['type' => CategoryType::INCOME]);

    $data = [
        'type' => TransactionType::INCOME->value,
        'amount' => 500.00,
        'description' => 'Salary payment',
        'category_id' => $incomeCategory->id,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->post(route('transactions.store', $this->account), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Transacción creada exitosamente.');

    $this->assertDatabaseHas('transactions', [
        'account_id' => $this->account->id,
        'type' => TransactionType::INCOME->value,
        'amount' => 500.00,
        'description' => 'Salary payment',
        'category_id' => $incomeCategory->id,
    ]);
});

test('user can create an expense transaction', function () {
    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 75.50,
        'description' => 'Grocery shopping',
        'category_id' => $this->category->id,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->post(route('transactions.store', $this->account), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Transacción creada exitosamente.');

    $this->assertDatabaseHas('transactions', [
        'account_id' => $this->account->id,
        'type' => TransactionType::EXPENSE->value,
        'amount' => 75.50,
        'description' => 'Grocery shopping',
        'category_id' => $this->category->id,
    ]);
});

test('user can create a transfer transaction', function () {
    $destinationAccount = Account::factory()->for($this->user)->for($this->currency)->create();

    $data = [
        'type' => TransactionType::TRANSFER->value,
        'amount' => 200.00,
        'description' => 'Transfer to savings',
        'destination_account_id' => $destinationAccount->id,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->post(route('transactions.store', $this->account), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Transacción creada exitosamente.');

    $this->assertDatabaseHas('transactions', [
        'account_id' => $this->account->id,
        'type' => TransactionType::TRANSFER_OUT->value,
        'amount' => 200.00,
        'description' => 'Transfer to savings',
        'destination_account_id' => $destinationAccount->id,
        'from_account_id' => null,
    ]);

    $this->assertDatabaseHas('transactions', [
        'account_id' => $destinationAccount->id,
        'type' => TransactionType::TRANSFER_IN->value,
        'amount' => 200.00,
        'description' => 'Transfer to savings',
        'destination_account_id' => null,
        'from_account_id' => $this->account->id,
    ]);
});

test('transaction creation validates required fields', function () {
    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type', 'amount', 'transaction_date']);
});

test('transaction creation validates transaction type enum', function () {
    $data = [
        'type' => 'invalid-type',
        'amount' => 100.00,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['type']);
});

test('transaction creation validates amount is not zero', function () {
    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 0,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['amount']);
});

test('transaction creation validates amount is numeric', function () {
    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 'not-numeric',
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['amount']);
});

test('transaction creation validates category exists', function () {
    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 100.00,
        'category_id' => 99999, // Non-existent category
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['category_id']);
});

test('transaction creation validates destination account exists', function () {
    $data = [
        'type' => TransactionType::TRANSFER->value,
        'amount' => 100.00,
        'destination_account_id' => 99999, // Non-existent account
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['destination_account_id']);
});

test('transaction creation validates description max length', function () {
    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 100.00,
        'description' => str_repeat('a', 256), // 256 characters
        'category_id' => $this->category->id,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['description']);
});

test('transaction creation validates transaction date is valid date', function () {
    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 100.00,
        'transaction_date' => 'invalid-date',
        'category_id' => $this->category->id,
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $this->account), $data);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['transaction_date']);
});

test('user cannot create transaction for account they do not own', function () {
    $otherUser = User::factory()->create();
    $otherAccount = Account::factory()->for($otherUser)->for($this->currency)->create();

    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 100.00,
        'category_id' => $this->category->id,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->postJson(route('transactions.store', $otherAccount), $data);

    $response->assertNotFound();
});

test('transaction creation without description is allowed', function () {
    $data = [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 50.00,
        'category_id' => $this->category->id,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->post(route('transactions.store', $this->account), $data);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Transacción creada exitosamente.');

    $this->assertDatabaseHas('transactions', [
        'account_id' => $this->account->id,
        'amount' => 50.00,
        'description' => '',
    ]);
});

test('transaction creation updates account balance', function () {
    $data = [
        'type' => TransactionType::INCOME->value,
        'amount' => 100.00,
        'category_id' => Category::factory()->for($this->user)->create(['type' => CategoryType::INCOME])->id,
        'transaction_date' => now()->toDateString(),
    ];

    $response = $this->actingAs($this->user)->post(route('transactions.store', $this->account), $data);

    expect($this->account->transactions()->count())->toBe(1)
        ->and($this->account->fresh()->balance)->toBe(100);
});

it('throws exception when destination_account is null', function () {
    $user = User::factory()->create();
    $account = Account::factory()->for($user)->create();

    $dto = new CreateTransactionDto(
        type: TransactionType::TRANSFER,
        amount: 100.00,
        transaction_date: '2025-10-10',
        description: 'Invalid transfer test',
        destination_account: null,
        category: null,
        conversion_rate: 0,
    );

    $action = app(CreateTransactionAction::class);

    $action->handle($account, $dto);
})->throws(Exception::class, 'Destination account is required for transfer in transactions.');
