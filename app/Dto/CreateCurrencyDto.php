<?php

declare(strict_types=1);

namespace App\Dto;

final class CreateCurrencyDto
{
    public function __construct(
        public readonly string $code,
        public readonly string $name,
        public readonly string $symbol,
        public readonly int $decimalPlaces,
        public readonly string $decimalSeparator,
        public readonly string $thousandsSeparator,
        public readonly string $symbolPosition,
        public readonly float $conversionRate,
        public readonly bool $isBase,
    ) {}

    /**
     * @param  array{code: string, name: string, symbol: string, decimal_places: int, decimal_separator: string, thousands_separator: string, symbol_position: string, conversion_rate: float, is_base: bool}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            code: $data['code'],
            name: $data['name'],
            symbol: $data['symbol'],
            decimalPlaces: $data['decimal_places'],
            decimalSeparator: $data['decimal_separator'],
            thousandsSeparator: $data['thousands_separator'],
            symbolPosition: $data['symbol_position'],
            conversionRate: $data['conversion_rate'],
            isBase: $data['is_base'] ?? false,
        );
    }

    /**
     * @return array{code: string, name: string, symbol: string, decimal_places: int, decimal_separator: string, thousands_separator: string, symbol_position: string, conversion_rate: float, is_base: bool}
     */
    public function toArray(): array
    {
        return [
            'code' => $this->code,
            'name' => $this->name,
            'symbol' => $this->symbol,
            'decimal_places' => $this->decimalPlaces,
            'decimal_separator' => $this->decimalSeparator,
            'thousands_separator' => $this->thousandsSeparator,
            'symbol_position' => $this->symbolPosition,
            'conversion_rate' => $this->conversionRate,
            'is_base' => $this->isBase,
        ];
    }
}
