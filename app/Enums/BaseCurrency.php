<?php

declare(strict_types=1);

namespace App\Enums;

enum BaseCurrency: string
{
    case EUR = 'EUR';
    case USD = 'USD';
    case DOP = 'DOP';
    case COP = 'COP';
    case MXN = 'MXN';
    case ARS = 'ARS';
    case BRL = 'BRL';
    case CLP = 'CLP';
    case PYG = 'PYG';

    /**
     * Get the currencies as an array with all fields.
     *
     * @return array<int, array<string, int|string>>
     */
    public static function toArray(): array
    {
        return array_map(fn (BaseCurrency $currency): array => [
            'value' => $currency->value,
            'label' => $currency->label(),
            'symbol' => $currency->symbol(),
            'decimal_places' => $currency->decimalPlaces(),
            'decimal_separator' => $currency->decimalSeparator(),
            'thousands_separator' => $currency->thousandsSeparator(),
            'symbol_position' => $currency->symbolPosition(),
        ], self::cases());
    }

    /**
     * Get the label for the currency.
     */
    public function label(): string
    {
        return match ($this) {
            self::EUR => 'Euro',
            self::USD => 'United States Dollar',
            self::DOP => 'Dominican Peso',
            self::COP => 'Colombian Peso',
            self::MXN => 'Mexican Peso',
            self::ARS => 'Argentine Peso',
            self::BRL => 'Brazilian Real',
            self::CLP => 'Chilean Peso',
            self::PYG => 'Paraguayan Guaraní',
        };
    }

    /**
     * Get the symbol for the currency.
     */
    public function symbol(): string
    {
        return match ($this) {
            self::EUR => '€',
            self::USD => '$',
            self::DOP => 'RD$',
            self::COP => 'COP',
            self::MXN => 'MXN',
            self::ARS => 'ARS',
            self::BRL => 'R$',
            self::CLP => 'CLP',
            self::PYG => 'PYG',
        };
    }

    /**
     * Get the number of decimal places for the currency.
     */
    public function decimalPlaces(): int
    {
        return match ($this) {
            self::PYG => 0,
            default => 2,
        };
    }

    /**
     * Get the decimal separator for the currency.
     */
    public function decimalSeparator(): string
    {
        return match ($this) {
            self::PYG => '.',
            self::EUR => ',',
            default => '.',
        };
    }

    /**
     * Get the thousands separator for the currency.
     */
    public function thousandsSeparator(): string
    {
        return match ($this) {
            self::PYG => '.',
            self::EUR => '.',
            default => ',',
        };
    }

    /**
     * Get the symbol position for the currency.
     */
    public function symbolPosition(): string
    {
        return match ($this) {
            self::PYG => 'prefix',
            self::EUR => 'prefix',
            default => 'suffix',
        };
    }
}
