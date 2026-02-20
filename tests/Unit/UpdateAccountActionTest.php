<?php

declare(strict_types=1);

use App\Actions\UpdateAccountAction;
use App\Dto\UpdateAccountDto;
use App\Enums\AccountType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Currency;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('updates account details without creating adjustment when balance adjustment is zero', function () {
    Queue::fake();

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true]);
    $account = Account::factory()->for($user)->for($currency)->create([
        'name' => 'Old name',
        'balance' => 250.00,
    ]);

    $action = app(UpdateAccountAction::class);

    $updated = $action->handle($account, new UpdateAccountDto(
        name: 'New name',
        type: AccountType::BANK,
        emoji: '🏦',
        color: '#111111',
        is_active: true,
        balance_adjustment: 0.0,
    ));

    expect($updated->name)->toBe('New name')
        ->and($updated->balance)->toBe(250.00);

    expect(Transaction::query()->where('description', 'Ajuste de balance')->exists())->toBeFalse();
});

it('creates an adjustment transaction when balance changes', function () {
    Queue::fake();

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true]);
    $account = Account::factory()->for($user)->for($currency)->create([
        'balance' => 100.00,
        'is_active' => true,
    ]);

    $action = app(UpdateAccountAction::class);

    $action->handle($account, new UpdateAccountDto(
        name: $account->name,
        type: $account->type,
        emoji: $account->emoji,
        color: $account->color,
        is_active: $account->is_active,
        balance_adjustment: 160.00,
    ));

    $transaction = Transaction::query()->where('description', 'Ajuste de balance')->first();

    expect($transaction)->not->toBeNull()
        ->and($transaction->type)->toBe(TransactionType::ADJUSTMENT_POSITIVE)
        ->and($transaction->amount)->toBe(60.00);

    expect($account->fresh()->balance)->toBe(160.00);
});
