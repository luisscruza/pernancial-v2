<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateTransactionDto;
use App\Dto\OnboardingAccountDto;
use App\Enums\AccountType;
use App\Enums\BaseCurrency;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class CreateOnboardingAccountAction
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private CreateCurrencyAction $createCurrencyAction,
        private CreateTransactionAction $createTransactionAction,
    ) {
        //
    }

    /**
     * Invoke the class instance.
     */
    public function handle(User $user, OnboardingAccountDto $data): void
    {
        DB::transaction(function () use ($user, $data): void {
            $currency = $this->createCurrencyAction->handle(
                user: $user,
                currency: BaseCurrency::from($data->currency_id),
                conversionRate: 1,
                isBase: true,
            );

            $type = AccountType::from($data->type);

            $account = $user->accounts()->create([
                'name' => $data->name,
                'currency_id' => $currency->id,
                'description' => $data->description,
                'balance' => 0,
                'type' => $type,
                'emoji' => $type->emoji(),
                'color' => $type->color(),
            ]);

            $user->update([
                'base_currency_id' => $currency->id,
            ]);

            $this->createTransactionAction->handle($account,
                new CreateTransactionDto(
                    type: 'initial',
                    amount: $data->balance,
                    transaction_date: now()->format('Y-m-d'),
                    description: 'Balance inicial',
                    destination_account_id: null,
                    category_id: null,
                    conversion_rate: null,
                ),
            );
        });
    }
}
