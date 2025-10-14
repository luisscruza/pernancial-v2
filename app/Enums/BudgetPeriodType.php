<?php

declare(strict_types=1);

namespace App\Enums;

enum BudgetPeriodType: string
{
    case MONTHLY = 'monthly';
    case WEEKLY = 'weekly';
    case YEARLY = 'yearly';
    case CUSTOM = 'custom';

    /**
     * Get the label for the budget period type.
     */
    public function label(): string
    {
        return match ($this) {
            self::MONTHLY => 'Mensual',
            self::WEEKLY => 'Semanal',
            self::YEARLY => 'Anual',
            self::CUSTOM => 'Personalizado',
        };
    }
}
