<?php

declare(strict_types=1);

use App\Ai\Tools\CreateFinanceTransactionTool;
use App\Ai\Tools\ListFinanceAccountsTool;
use App\Ai\Tools\QueryFinanceTransactionsTool;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Support\Carbon;
use Laravel\Ai\Tools\Request;

it('lists user accounts through finance accounts tool', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['code' => 'USD']);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Cash Wallet',
        'balance' => 250.00,
        'is_active' => true,
    ]);

    $output = (string) (new ListFinanceAccountsTool($user))->handle(new Request([]));

    expect($output)
        ->toContain('Cuentas:')
        ->toContain(sprintf('id=%d', $account->id))
        ->toContain('Cash Wallet')
        ->toContain('USD');
});

it('creates an income transaction through finance transaction tool', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['code' => 'USD']);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
        'balance' => 100.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Salary',
        'type' => CategoryType::INCOME,
    ]);

    $tool = new CreateFinanceTransactionTool($user);

    $output = (string) $tool->handle(new Request([
        'type' => TransactionType::INCOME->value,
        'amount' => 50,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'transaction_date' => '2026-02-06',
        'description' => 'Salary payment',
    ]));

    $account->refresh();
    $createdTransaction = $account->transactions()->latest('id')->first();

    expect($output)->toContain('Transaccion creada: tipo=income')
        ->and($account->balance)->toBe(50.00)
        ->and($account->transactions()->where('type', TransactionType::INCOME)->count())->toBe(1)
        ->and($createdTransaction?->ai_assisted)->toBeTrue();
});

it('lists recent transactions for a specific account through finance query tool', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'code' => 'USD',
        'is_base' => true,
    ]);

    $user->update(['base_currency_id' => $currency->id]);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Cash Wallet',
        'balance' => 1000.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Food',
        'type' => CategoryType::EXPENSE,
    ]);

    $olderTransaction = $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 18.50,
        'transaction_date' => now()->subDays(5)->toDateString(),
        'description' => 'Lunch',
        'category_id' => $category->id,
        'running_balance' => 981.50,
        'converted_amount' => 18.50,
        'conversion_rate' => 1,
    ]);

    $latestTransaction = $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 35.25,
        'transaction_date' => now()->subDays(1)->toDateString(),
        'description' => 'Groceries',
        'category_id' => $category->id,
        'running_balance' => 946.25,
        'converted_amount' => 35.25,
        'conversion_rate' => 1,
    ]);

    $tool = new QueryFinanceTransactionsTool($user);

    $output = (string) $tool->handle(new Request([
        'query_type' => 'recent_transactions',
        'account_id' => $account->id,
        'limit' => 1,
    ]));

    expect($output)
        ->toContain('Transacciones recientes de la cuenta "Cash Wallet"')
        ->toContain(sprintf('id=%d', $latestTransaction->id))
        ->not->toContain('Lunch');
});

it('lists recent transactions across all accounts when account is not provided', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'code' => 'USD',
        'is_base' => true,
    ]);

    $user->update(['base_currency_id' => $currency->id]);

    $walletAccount = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Wallet',
        'balance' => 350.00,
    ]);

    $bankAccount = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Bank',
        'balance' => 920.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Transport',
        'type' => CategoryType::EXPENSE,
    ]);

    $walletAccount->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 12.00,
        'transaction_date' => now()->subDays(2)->toDateString(),
        'description' => 'Metro ride',
        'category_id' => $category->id,
        'running_balance' => 338.00,
        'converted_amount' => 12.00,
        'conversion_rate' => 1,
    ]);

    $bankAccount->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 28.00,
        'transaction_date' => now()->subDay()->toDateString(),
        'description' => 'Dinner',
        'category_id' => $category->id,
        'running_balance' => 892.00,
        'converted_amount' => 28.00,
        'conversion_rate' => 1,
    ]);

    $tool = new QueryFinanceTransactionsTool($user);

    $output = (string) $tool->handle(new Request([
        'query_type' => 'recent_transactions',
        'limit' => 2,
    ]));

    expect($output)
        ->toContain('Transacciones recientes de todas las cuentas del usuario')
        ->toContain('cuenta="Wallet"')
        ->toContain('cuenta="Bank"')
        ->toContain('Metro ride')
        ->toContain('Dinner');
});

it('calculates category spending for last month through finance query tool', function () {
    Carbon::setTestNow(Carbon::parse('2026-02-15 09:30:00'));

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'code' => 'USD',
        'is_base' => true,
    ]);

    $user->update(['base_currency_id' => $currency->id]);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
        'balance' => 1000.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Food',
        'type' => CategoryType::EXPENSE,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 40.00,
        'transaction_date' => '2026-01-05',
        'description' => 'Restaurant',
        'category_id' => $category->id,
        'running_balance' => 960.00,
        'converted_amount' => 40.00,
        'conversion_rate' => 1,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 60.00,
        'transaction_date' => '2026-01-20',
        'description' => 'Supermarket',
        'category_id' => $category->id,
        'running_balance' => 900.00,
        'converted_amount' => 60.00,
        'conversion_rate' => 1,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 10.00,
        'transaction_date' => '2026-02-10',
        'description' => 'Snack',
        'category_id' => $category->id,
        'running_balance' => 890.00,
        'converted_amount' => 10.00,
        'conversion_rate' => 1,
    ]);

    $tool = new QueryFinanceTransactionsTool($user);

    $output = (string) $tool->handle(new Request([
        'query_type' => 'category_spending',
        'category_id' => $category->id,
        'period' => 'last_month',
    ]));

    expect($output)
        ->toContain('Resumen de gasto en la categoria "Food"')
        ->toContain('periodo=last_month, fecha_desde=2026-01-01, fecha_hasta=2026-01-31')
        ->toContain('total_gastado_base=100.00 USD')
        ->toContain('transacciones=2');

    Carbon::setTestNow();
});

it('falls back to global category spending when account filter is invalid', function () {
    Carbon::setTestNow(Carbon::parse('2026-02-15 09:30:00'));

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'code' => 'USD',
        'is_base' => true,
    ]);

    $user->update(['base_currency_id' => $currency->id]);

    $firstAccount = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Wallet',
        'balance' => 500.00,
    ]);

    $secondAccount = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Bank',
        'balance' => 900.00,
    ]);

    $hugoCategory = Category::factory()->for($user)->create([
        'name' => 'Hugo',
        'type' => CategoryType::EXPENSE,
    ]);

    $firstAccount->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 25.00,
        'transaction_date' => '2026-01-10',
        'description' => 'Hugo ride',
        'category_id' => $hugoCategory->id,
        'running_balance' => 475.00,
        'converted_amount' => 25.00,
        'conversion_rate' => 1,
    ]);

    $secondAccount->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 45.00,
        'transaction_date' => '2026-01-11',
        'description' => 'Hugo food',
        'category_id' => $hugoCategory->id,
        'running_balance' => 855.00,
        'converted_amount' => 45.00,
        'conversion_rate' => 1,
    ]);

    $tool = new QueryFinanceTransactionsTool($user);

    $output = (string) $tool->handle(new Request([
        'query_type' => 'category_spending',
        'category_name' => 'hug',
        'account_name' => 'Cuenta que no existe',
        'period' => 'last_month',
    ]));

    expect($output)
        ->toContain('No se pudo resolver la cuenta indicada. Se calculo el total global sin filtro por cuenta.')
        ->toContain('Resumen de gasto en la categoria "Hugo"')
        ->toContain('total_gastado_base=70.00 USD')
        ->toContain('transacciones=2')
        ->not->toContain('cuenta_filtrada=');

    Carbon::setTestNow();
});
