<?php

declare(strict_types=1);

namespace App\Enums;

enum TransactionType: string
{
    case INCOME = 'income';
    case EXPENSE = 'expense';
    case TRANSFER = 'transfer';
    case INITIAL = 'initial';

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
        };
    }
}
