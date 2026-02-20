<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\UpdatePayableDto;
use App\Models\Payable;

final class UpdatePayableAction
{
    /**
     * Update the payable.
     */
    public function handle(Payable $payable, UpdatePayableDto $data): Payable
    {
        $status = 'open';

        if ($payable->amount_paid > 0) {
            $status = $payable->amount_paid >= $data->amount_total ? 'paid' : 'partial';
        }

        $payable->update([
            'contact_id' => $data->contact->id,
            'currency_id' => $data->currency->id,
            'amount_total' => $data->amount_total,
            'due_date' => $data->due_date,
            'description' => $data->description,
            'status' => $status,
        ]);

        return $payable->fresh();
    }
}
