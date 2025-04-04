<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\BaseCurrency;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class CreateCurrencyAction
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Invoke the class instance.
     */
    public function handle(User $user, BaseCurrency $currency, ?float $conversionRate = 1, bool $isBase = false): Currency
    {
        return DB::transaction(fn (): Currency => $user->currencies()->create([
            'code' => $currency->value,
            'name' => $currency->label(),
            'symbol' => $currency->symbol(),
            'decimal_places' => $currency->decimalPlaces(),
            'decimal_separator' => $currency->decimalSeparator(),
            'thousands_separator' => $currency->thousandsSeparator(),
            'symbol_position' => $currency->symbolPosition(),
            'conversion_rate' => $conversionRate,
            'is_base' => $isBase,
        ]));
    }
}
