<?php

declare(strict_types=1);

use App\Actions\CreateTransactionAction;
use App\Dto\CreateTransactionDto;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('marks account balance recalculation to run after commit', function () {
    Queue::fake();

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create(['type' => CategoryType::INCOME]);

    $action = app(CreateTransactionAction::class);

    $action->handle($account, new CreateTransactionDto(
        type: TransactionType::INCOME,
        amount: 100.00,
        transaction_date: '2025-01-03',
        description: 'Backdated income',
        destination_account: null,
        category: $category,
        conversion_rate: null,
    ));

    Queue::assertPushed(UpdateAccountBalance::class, function (UpdateAccountBalance $job) use ($account): bool {
        return $job->account->is($account) && $job->afterCommit === true;
    });
});
