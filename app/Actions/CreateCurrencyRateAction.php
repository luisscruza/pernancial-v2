<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CurrencyRateDto;
use App\Models\Currency;
use App\Models\CurrencyRate;
use Illuminate\Support\Facades\DB;

final class CreateCurrencyRateAction
{
    public function execute(Currency $currency, CurrencyRateDto $dto): CurrencyRate
    {
        return DB::transaction(function () use ($currency, $dto) {
            // Create the new rate record
            $currencyRate = CurrencyRate::create([
                'currency_id' => $currency->id,
                'rate' => $dto->rate,
                'effective_date' => $dto->effectiveDate,
            ]);

            // Update the currency's current conversion rate if this is the most recent rate
            $latestRate = CurrencyRate::where('currency_id', $currency->id)
                ->orderBy('effective_date', 'desc')
                ->first();

            if ($latestRate && $latestRate->id === $currencyRate->id) {
                $currency->update(['conversion_rate' => $dto->rate]);
            }

            return $currencyRate;
        });
    }
}
