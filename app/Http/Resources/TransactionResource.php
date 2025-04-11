<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Transaction */
final class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'deleted_at' => $this->deleted_at,
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
            'destination_running_balance' => $this->destination_running_balance,
            'running_balance' => $this->running_balance,
            'converted_amount' => $this->converted_amount,
            'conversion_rate' => $this->conversion_rate,
            'category_id' => $this->category_id,
            'destination_account_id' => $this->destination_account_id,
            'account_id' => $this->account_id,
            'description' => $this->description,
            'transaction_date' => $this->transaction_date,
            'amount' => $this->amount,
            'type' => $this->type,
            'user_id' => $this->user_id,
            'id' => $this->id,
        ];
    }
}
