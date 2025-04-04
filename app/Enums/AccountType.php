<?php

declare(strict_types=1);

namespace App\Enums;

enum AccountType: string
{
    case SAVINGS = 'savings';
    case CHECKING = 'checking';
    case CASH = 'cash';
    case BANK = 'bank';
    case CREDIT_CARD = 'credit_card';
    case GENERAL = 'general';
    case INVESTMENT = 'investment';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Efectivo',
            self::BANK => 'Banco',
            self::CREDIT_CARD => 'Tarjeta de crédito',
            self::SAVINGS => 'Ahorro',
            self::CHECKING => 'Cuenta corriente',
            self::GENERAL => 'General',
            self::INVESTMENT => 'Inversión',
        };
    }

    /**
     * Get the default emoji for the account type.
     */
    public function emoji(): string
    {
        return match ($this) {
            self::CASH => '💵',
            self::BANK => '🏦',
            self::CREDIT_CARD => '💳',
            self::SAVINGS => '💰',
            self::CHECKING => '💸',
            self::GENERAL => '💼',
            self::INVESTMENT => '💸',
        };
    }

    /**
     * Get the default color for the account type.
     */
    public function color(): string
    {
        return match ($this) {
            self::CASH => '#bfbfbf',
            self::BANK => '#bfbfbf',
            self::CREDIT_CARD => '#FF0000',
            self::SAVINGS => '#f59e0b',
            self::CHECKING => '#0000FF',
            self::GENERAL => '#0EA5E9',
            self::INVESTMENT => '#84CC16',
        };
    }
}
