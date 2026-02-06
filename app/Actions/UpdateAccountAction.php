<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateTransactionDto;
use App\Dto\UpdateAccountDto;
use App\Enums\TransactionType;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

final readonly class UpdateAccountAction
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private CreateTransactionAction $createTransactionAction,
    ) {
        //
    }

    /**
     * Update the account and handle balance adjustments if necessary.
     */
    public function handle(Account $account, UpdateAccountDto $data): Account
    {
        return DB::transaction(function () use ($account, $data) {
            // Update account details
            $account->update([
                'name' => $data->name,
                'type' => $data->type,
                'emoji' => $data->emoji,
                'color' => $data->color,
                'is_active' => $data->is_active,
            ]);

            $adjustment = (float) $data->balance_adjustment;

            if ($adjustment !== 0.0) {
                $this->handleBalanceAdjustment($account, $adjustment);
            }

            return $account->fresh();
        });
    }

    /**
     * Create an adjustment transaction to match the desired balance.
     */
    private function handleBalanceAdjustment(Account $account, float $newBalance): void
    {
        $currentBalance = $account->balance;
        $difference = $newBalance - $currentBalance;

        if ($difference === 0.0) {
            return;
        }

        $transactionDto = new CreateTransactionDto(
            type: $difference < 0 ? TransactionType::ADJUSTMENT_NEGATIVE : TransactionType::ADJUSTMENT_POSITIVE,
            amount: abs($difference),
            transaction_date: now()->toDateString(),
            description: 'Ajuste de balance',
            category: null,
            destination_account: null,
            conversion_rate: 1,
            received_amount: null,
        );

        $this->createTransactionAction->handle($account, $transactionDto);
    }
}
