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
}
