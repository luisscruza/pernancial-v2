<?php

declare(strict_types=1);

namespace App\Enums;

enum CategoryType: string
{
    case INCOME = 'income';
    case EXPENSE = 'expense';

    /**
     * Get the label for the category type.
     */
    public function label(): string
    {
        return match ($this) {
            self::INCOME => 'Ingreso',
            self::EXPENSE => 'Gasto',
        };
    }
}
