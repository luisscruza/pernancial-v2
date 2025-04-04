<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AccountResource extends JsonResource
{
    public static $wrap = null;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type->label(),
            'emoji' => $this->emoji,
            'color' => $this->color,
            'balance' => $this->balance,
            'currency' => $this->whenLoaded('currency', function () {
                return new CurrencyResource($this->currency);
            }),
            'description' => $this->description,
        ];
    }
}
