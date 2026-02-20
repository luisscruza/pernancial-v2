<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreatePayableDto;
use App\Models\Payable;
use App\Models\User;

final class CreatePayableAction
{
    /**
     * Execute the action.
     */
    public function handle(User $user, CreatePayableDto $data): Payable
    {
        $payable = $user->payables()->create([
            'contact_id' => $data->contact->id,
            'currency_id' => $data->currency->id,
            'payable_series_id' => $data->series?->id,
            'amount_total' => $data->amount_total,
            'amount_paid' => 0,
            'status' => 'open',
            'description' => $data->description,
            'due_date' => $data->due_date,
            'origin_transaction_id' => $data->origin_transaction?->id,
        ]);

        return $payable->fresh();
    }
}
