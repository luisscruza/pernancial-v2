<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreatePayableSeriesDto;
use App\Models\PayableSeries;
use App\Models\User;

final class CreatePayableSeriesAction
{
    /**
     * Execute the action.
     */
    public function handle(User $user, CreatePayableSeriesDto $data): PayableSeries
    {
        return $user->payableSeries()->create([
            'contact_id' => $data->contact->id,
            'currency_id' => $data->currency->id,
            'name' => $data->name,
            'default_amount' => $data->default_amount,
            'is_recurring' => $data->is_recurring,
            'recurrence_rule' => $data->recurrence_rule,
            'next_due_date' => $data->next_due_date,
        ]);
    }
}
