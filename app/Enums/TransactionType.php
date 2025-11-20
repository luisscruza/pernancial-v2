<?php

declare(strict_types=1);

namespace App\Enums;

enum TransactionType: string
{
    case INCOME = 'income';
    case EXPENSE = 'expense';
    case TRANSFER = 'transfer';
    case INITIAL = 'initial';
    case TRANSFER_IN = 'transfer_in';
    case TRANSFER_OUT = 'transfer_out';
    case ADJUSTMENT_NEGATIVE = 'adjustment_negative';
    case ADJUSTMENT_POSITIVE = 'adjustment_positive';

    /**
     * Get the label for the transaction type.
     */
    public function label(): string
    {
        return match ($this) {
            self::INCOME => 'Ingreso',
            self::EXPENSE => 'Gasto',
            self::TRANSFER => 'Transferencia',
            self::INITIAL => 'Inicial',
            self::TRANSFER_IN => 'Transferencia entrante',
            self::TRANSFER_OUT => 'Transferencia saliente',
            self::ADJUSTMENT_NEGATIVE => 'Ajuste negativo',
            self::ADJUSTMENT_POSITIVE => 'Ajuste positivo',
        };
    }

    /**
     * Determine if the transaction type is positive or negative.
     */
    public function isPositive(): bool
    {
        return match ($this) {
            self::INCOME, self::TRANSFER_IN, self::INITIAL, self::ADJUSTMENT_POSITIVE => true,
            self::EXPENSE, self::TRANSFER_OUT, self::ADJUSTMENT_NEGATIVE => false,
        };
    }

    /**
     * Is creatable
     */
    public function isCreatable(): bool
    {
        return match ($this) {
            self::INCOME, self::EXPENSE, self::TRANSFER => true,
            default => false,
        };
    }
}