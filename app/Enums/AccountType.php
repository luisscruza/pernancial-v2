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
    case DEBIT_CARD = 'debit_card';
    case CXC = 'cxc';
    case CXP = 'cxp';

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
            self::DEBIT_CARD => 'Tarjeta de débito',
            self::CXC => 'Cuentas por cobrar',
            self::CXP => 'Cuentas por pagar',
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
            self::DEBIT_CARD => '🏧',
            self::CXC => '📥',
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

    public function description(): string
    {
        return match ($this) {
            self::CASH => 'Para gastos diarios y efectivo',
            self::BANK => 'Para cuentas bancarias generales',
            self::CREDIT_CARD => 'Para tarjetas de crédito',
            self::SAVINGS => 'Para ahorros y metas financieras',
            self::CHECKING => 'Para cuentas corrientes',
            self::GENERAL => 'Para propósitos generales',
            self::INVESTMENT => 'Para inversiones y portafolios',
        };
    }

    /**
     * The accounting type.
     */
    public function accountingType(): string
    {
        return match ($this) {
            self::CXC => 'cxc',
            self::CXP => 'cxp',
            self::CREDIT_CARD => 'cxp',
            self::DEBIT_CARD => 'normal',
            self::SAVINGS => 'normal',
            self::CHECKING => 'normal',
            self::CASH => 'normal',
            self::BANK => 'normal',
            self::GENERAL => 'normal',
            self::INVESTMENT => 'normal',
            default => 'normal',
        };
    }
}
