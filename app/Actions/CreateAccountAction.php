<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateAccountDto;
use App\Models\Account;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final readonly class CreateAccountAction
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        private CreateInitialTransactionAction $createInitialTransactionAction,
    ) {
        //
    }

    /**
     * Handle the account creation process.
     */
    public function handle(User $user, CreateAccountDto $data): ?Account
    {
        return DB::transaction(function () use ($user, $data) {
            $account = $user->accounts()->create([
                'name' => $data->name,
                'description' => $data->description,
                'type' => $data->type,
                'currency_id' => $data->currency->id,
                'emoji' => $data->type->emoji(),
                'color' => $data->type->color(),
            ]);

            $this->createInitialTransactionAction->handle($account, $data->balance);

            return $account->fresh();
        });
    }
}
