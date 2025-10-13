<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateCurrencyDto;
use App\Models\Currency;
use App\Models\CurrencyRate;
use Illuminate\Support\Facades\DB;

final class UpdateCurrencyAction
{
    public function handle(Currency $currency, CreateCurrencyDto $dto): Currency
    {
        return DB::transaction(function () use ($currency, $dto) {
            // Check if conversion rate changed
            $rateChanged = $currency->conversion_rate !== $dto->conversionRate;

            // Update the currency
            $currency->update([
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

            // Create new currency rate record if rate changed
            if ($rateChanged) {
                CurrencyRate::create([
                    'currency_id' => $currency->id,
                    'rate' => $dto->conversionRate,
                    'effective_date' => now()->toDateString(),
                ]);
            }

            return $currency->fresh();
        });
    }
}
