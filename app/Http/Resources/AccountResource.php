<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Account
 **/
final class AccountResource extends JsonResource
{
    public static $wrap;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'type' => $this->type->label(),
            'accounting_type' => $this->accounting_type,
            'emoji' => $this->emoji,
            'color' => $this->color,
            'balance' => $this->balance,
            'balance_in_base' => $this->balance_in_base,
            'currency' => new CurrencyResource($this->currency),
            'description' => $this->description,
        ];
    }
}
