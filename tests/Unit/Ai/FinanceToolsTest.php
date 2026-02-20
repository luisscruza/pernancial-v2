<?php

declare(strict_types=1);

use App\Ai\Tools\CreateFinanceTransactionTool;
use App\Ai\Tools\GenerateFinanceChartTool;
use App\Ai\Tools\ImportFinanceStatementTool;
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

it('requires confirmation when detecting a potential duplicate expense', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['code' => 'USD']);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
        'balance' => 300.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Food',
        'type' => CategoryType::EXPENSE,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 12.50,
        'transaction_date' => '2026-02-06',
        'description' => 'Cafe de la manana',
        'category_id' => $category->id,
        'running_balance' => 287.50,
        'converted_amount' => 12.50,
        'conversion_rate' => 1,
        'ai_assisted' => true,
    ]);

    $tool = new CreateFinanceTransactionTool($user);

    $output = (string) $tool->handle(new Request([
        'type' => TransactionType::EXPENSE->value,
        'amount' => 12.50,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'transaction_date' => '2026-02-06',
        'description' => 'Cafe de la manana',
    ]));

    expect($output)
        ->toContain('Posible gasto duplicado detectado')
        ->toContain('confirm_duplicate=true')
        ->and($account->transactions()->where('type', TransactionType::EXPENSE)->count())->toBe(1);
});

it('creates expense when duplicate confirmation is explicitly provided', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['code' => 'USD']);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
        'balance' => 300.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Food',
        'type' => CategoryType::EXPENSE,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 12.50,
        'transaction_date' => '2026-02-06',
        'description' => 'Cafe de la manana',
        'category_id' => $category->id,
        'running_balance' => 287.50,
        'converted_amount' => 12.50,
        'conversion_rate' => 1,
        'ai_assisted' => true,
    ]);

    $tool = new CreateFinanceTransactionTool($user);

    $output = (string) $tool->handle(new Request([
        'type' => TransactionType::EXPENSE->value,
        'amount' => 12.50,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'transaction_date' => '2026-02-06',
        'description' => 'Cafe de la manana',
        'confirm_duplicate' => true,
    ]));

    $account->refresh();

    expect($output)
        ->toContain('Transaccion creada: tipo=expense')
        ->and($account->transactions()->where('type', TransactionType::EXPENSE)->count())->toBe(2);
});

it('detects likely duplicate statement entries even when the date is not exact', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['code' => 'USD']);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
        'balance' => 300.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Supermercado',
        'type' => CategoryType::EXPENSE,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 45.00,
        'transaction_date' => '2026-02-01',
        'description' => 'Chedraui Centro',
        'category_id' => $category->id,
        'running_balance' => 255.00,
        'converted_amount' => 45.00,
        'conversion_rate' => 1,
    ]);

    $tool = new ImportFinanceStatementTool($user);

    $output = (string) $tool->handle(new Request([
        'mode' => 'preview',
        'account_id' => $account->id,
        'default_expense_category_id' => $category->id,
        'entries' => [
            [
                'type' => 'expense',
                'amount' => 45.00,
                'transaction_date' => '2026-02-04',
                'description' => 'Compra Chedraui centro',
            ],
        ],
    ]));

    expect($output)
        ->toContain('posibles_duplicados=1')
        ->toContain('posible duplicado');
});

it('imports only non-duplicate statement entries in commit mode', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['code' => 'USD']);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
        'balance' => 500.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Supermercado',
        'type' => CategoryType::EXPENSE,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 45.00,
        'transaction_date' => '2026-02-01',
        'description' => 'Chedraui Centro',
        'category_id' => $category->id,
        'running_balance' => 455.00,
        'converted_amount' => 45.00,
        'conversion_rate' => 1,
    ]);

    $tool = new ImportFinanceStatementTool($user);

    $output = (string) $tool->handle(new Request([
        'mode' => 'commit',
        'account_id' => $account->id,
        'default_expense_category_id' => $category->id,
        'entries' => [
            [
                'type' => 'expense',
                'amount' => 45.00,
                'transaction_date' => '2026-02-03',
                'description' => 'Compra Chedraui centro',
            ],
            [
                'type' => 'expense',
                'amount' => 60.00,
                'transaction_date' => '2026-02-06',
                'description' => 'Supermercado semanal',
            ],
        ],
    ]));

    expect($output)
        ->toContain('creados=1')
        ->toContain('duplicados_omitidos=1')
        ->and($account->transactions()->where('type', TransactionType::EXPENSE)->count())->toBe(2);
});

it('supports grouping statement entries with manual keys', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['code' => 'USD']);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
        'balance' => 300.00,
    ]);

    $category = Category::factory()->for($user)->create([
        'name' => 'Supermercado',
        'type' => CategoryType::EXPENSE,
    ]);

    $tool = new ImportFinanceStatementTool($user);

    $output = (string) $tool->handle(new Request([
        'mode' => 'commit',
        'group_strategy' => 'manual_keys',
        'account_id' => $account->id,
        'default_expense_category_id' => $category->id,
        'entries' => [
            [
                'type' => 'expense',
                'amount' => 12.50,
                'transaction_date' => '2026-01-10',
                'description' => 'Supermercado A',
                'group_key' => 'super-enero',
                'group_description' => 'Supermercados enero',
            ],
            [
                'type' => 'expense',
                'amount' => 22.10,
                'transaction_date' => '2026-01-15',
                'description' => 'Supermercado B',
                'group_key' => 'super-enero',
                'group_description' => 'Supermercados enero',
            ],
        ],
    ]));

    $createdExpense = $account->transactions()
        ->where('type', TransactionType::EXPENSE)
        ->latest('id')
        ->first();

    expect($output)
        ->toContain('creados=1')
        ->toContain('agrupado=2')
        ->and($account->transactions()->where('type', TransactionType::EXPENSE)->count())->toBe(1)
        ->and($createdExpense?->amount)->toBe(34.60)
        ->and($createdExpense?->description)->toContain('Supermercados enero');
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

it('generates spending by category chart payload', function () {
    Carbon::setTestNow(Carbon::parse('2026-02-20 10:00:00'));

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'code' => 'USD',
        'is_base' => true,
    ]);

    $user->update(['base_currency_id' => $currency->id]);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
    ]);

    $food = Category::factory()->for($user)->create([
        'name' => 'Food',
        'type' => CategoryType::EXPENSE,
    ]);

    $transport = Category::factory()->for($user)->create([
        'name' => 'Transport',
        'type' => CategoryType::EXPENSE,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 70.00,
        'transaction_date' => '2026-02-11',
        'description' => 'Restaurant',
        'category_id' => $food->id,
        'running_balance' => 930.00,
        'converted_amount' => 70.00,
        'conversion_rate' => 1,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 20.00,
        'transaction_date' => '2026-02-12',
        'description' => 'Bus',
        'category_id' => $transport->id,
        'running_balance' => 910.00,
        'converted_amount' => 20.00,
        'conversion_rate' => 1,
    ]);

    $output = (string) (new GenerateFinanceChartTool($user))->handle(new Request([
        'chart_type' => 'spending_by_category',
        'period' => 'this_month',
    ]));

    $payload = json_decode($output, true);

    expect($payload)
        ->toBeArray()
        ->and($payload['kind'] ?? null)->toBe('bar')
        ->and($payload['title'] ?? null)->toBe('Gasto por categoria')
        ->and($payload['series'][0]['key'] ?? null)->toBe('amount')
        ->and($payload['points'][0]['label'] ?? null)->toBe('Food')
        ->and($payload['points'][0]['amount'] ?? null)->toBe(70);

    Carbon::setTestNow();
});

it('generates income vs expense chart payload', function () {
    Carbon::setTestNow(Carbon::parse('2026-03-20 10:00:00'));

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create([
        'code' => 'USD',
        'is_base' => true,
    ]);

    $user->update(['base_currency_id' => $currency->id]);

    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Main Account',
    ]);

    $incomeCategory = Category::factory()->for($user)->create([
        'name' => 'Salary',
        'type' => CategoryType::INCOME,
    ]);

    $expenseCategory = Category::factory()->for($user)->create([
        'name' => 'Food',
        'type' => CategoryType::EXPENSE,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::INCOME,
        'amount' => 1000.00,
        'transaction_date' => '2026-02-01',
        'description' => 'Payroll',
        'category_id' => $incomeCategory->id,
        'running_balance' => 1000.00,
        'converted_amount' => 1000.00,
        'conversion_rate' => 1,
    ]);

    $account->transactions()->create([
        'type' => TransactionType::EXPENSE,
        'amount' => 300.00,
        'transaction_date' => '2026-02-15',
        'description' => 'Groceries',
        'category_id' => $expenseCategory->id,
        'running_balance' => 700.00,
        'converted_amount' => 300.00,
        'conversion_rate' => 1,
    ]);

    $output = (string) (new GenerateFinanceChartTool($user))->handle(new Request([
        'chart_type' => 'income_vs_expense',
        'period' => 'this_year',
    ]));

    $payload = json_decode($output, true);

    expect($payload)
        ->toBeArray()
        ->and($payload['kind'] ?? null)->toBe('stacked_bar')
        ->and($payload['series'][0]['key'] ?? null)->toBe('income')
        ->and($payload['series'][1]['key'] ?? null)->toBe('expense');

    Carbon::setTestNow();
});
