<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateCurrencyDto;
use App\Models\Currency;
use App\Models\CurrencyRate;
use Illuminate\Support\Facades\DB;

final class CreateCurrencyAction
{
    public function handle(CreateCurrencyDto $dto, int $userId): Currency
    {
        return DB::transaction(function () use ($dto, $userId) {
            $currency = Currency::create([
                'user_id' => $userId,
                'code' => $dto->code,
                'name' => $dto->name,
                'symbol' => $dto->symbol,
                'decimal_places' => $dto->decimalPlaces,
                'decimal_separator' => $dto->decimalSeparator,
                'thousands_separator' => $dto->thousandsSeparator,
                'symbol_position' => $dto->symbolPosition,
                'conversion_rate' => $dto->conversionRate,
                'is_base' => $dto->isBase,
            ]);

            // Create initial currency rate record
            CurrencyRate::create([
                'currency_id' => $currency->id,
                'rate' => $dto->conversionRate,
                'effective_date' => now()->toDateString(),
            ]);

            return $currency;
        });
    }
}
