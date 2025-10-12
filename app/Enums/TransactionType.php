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
        };
    }
}
