<?php

declare(strict_types=1);

namespace App\Dto;

final class CurrencyRateDto
{
    public function __construct(
        public readonly int $currencyId,
        public readonly float $rate,
        public readonly string $effectiveDate,
    ) {}

    /**
     * @param  array{currency_id: int, rate: float, effective_date: string}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            currencyId: $data['currency_id'],
            rate: $data['rate'],
            effectiveDate: $data['effective_date'],
        );
    }

    /**
     * @return array{currency_id: int, rate: float, effective_date: string}
     */
    public function toArray(): array
    {
        return [
            'currency_id' => $this->currencyId,
            'rate' => $this->rate,
            'effective_date' => $this->effectiveDate,
        ];
    }
}
