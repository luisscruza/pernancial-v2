<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateReceivableDto;
use App\Models\Receivable;
use App\Models\User;

final readonly class CreateReceivableAction
{
    /**
     * Execute the action.
     */
    public function handle(User $user, CreateReceivableDto $data): Receivable
    {
        $receivable = $user->receivables()->create([
            'contact_id' => $data->contact->id,
            'currency_id' => $data->currency->id,
            'series_id' => $data->series?->id,
            'amount_total' => $data->amount_total,
            'amount_paid' => 0,
            'status' => 'open',
            'description' => $data->description,
            'due_date' => $data->due_date,
            'origin_transaction_id' => $data->origin_transaction?->id,
        ]);

        return $receivable->fresh();
    }
}
