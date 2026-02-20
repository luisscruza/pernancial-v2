<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateReceivableSeriesDto;
use App\Models\ReceivableSeries;
use App\Models\User;

final class CreateReceivableSeriesAction
{
    /**
     * Create a receivable series for the given user.
     */
    public function handle(User $user, CreateReceivableSeriesDto $data): ReceivableSeries
    {
        return $user->receivableSeries()->create([
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
