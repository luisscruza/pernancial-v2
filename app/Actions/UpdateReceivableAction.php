<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\UpdateReceivableDto;
use App\Models\Receivable;

final class UpdateReceivableAction
{
    /**
     * Update the receivable.
     */
    public function handle(Receivable $receivable, UpdateReceivableDto $data): Receivable
    {
        $status = 'open';

        if ($receivable->amount_paid > 0) {
            $status = $receivable->amount_paid >= $data->amount_total ? 'paid' : 'partial';
        }

        $receivable->update([
            'contact_id' => $data->contact->id,
            'currency_id' => $data->currency->id,
            'amount_total' => $data->amount_total,
            'due_date' => $data->due_date,
            'description' => $data->description,
            'status' => $status,
        ]);

        return $receivable->fresh();
    }
}
