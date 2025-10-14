<?php

declare(strict_types=1);

namespace App\Enums;

enum BudgetType: string
{
    case PERIOD = 'period';
    case ONE_TIME = 'one_time';

    /**
     * Get the label for the budget type.
     */
    public function label(): string
    {
        return match ($this) {
            self::PERIOD => 'Presupuesto por período',
            self::ONE_TIME => 'Presupuesto único',
        };
    }
}
