<?php

declare(strict_types=1);

use App\Ai\Tools\CreateFinanceTransactionTool;
use App\Ai\Tools\ListFinanceAccountsTool;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;
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
        ->toContain('Accounts:')
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

    expect($output)->toContain('Transaction created: type=income')
        ->and($account->balance)->toBe(50.00)
        ->and($account->transactions()->where('type', TransactionType::INCOME)->count())->toBe(1);
});
