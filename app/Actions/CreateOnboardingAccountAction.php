<?php

declare(strict_types=1);

namespace App\Actions;

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
    ) {
        //
    }

    /**
     * Invoke the class instance.
     *
     * @param  array{name: string, description: string, balance: float, currency_id: string, type: string}  $data
     */
    public function handle(User $user, array $data): void
    {
        DB::transaction(function () use ($user, $data): void {
            $currency = $this->createCurrencyAction->handle(
                user: $user,
                currency: BaseCurrency::from($data['currency_id']),
                conversionRate: 1,
                isBase: true,
            );

            $type = AccountType::from($data['type']);

            $user->accounts()->create([
                'name' => $data['name'],
                'currency_id' => $currency->id,
                'description' => $data['description'],
                'balance' => $data['balance'],
                'type' => $type,
                'emoji' => $type->emoji(),
                'color' => $type->color(),
            ]);

            $user->update([
                'base_currency_id' => $currency->id,
            ]);
        });
    }
}
