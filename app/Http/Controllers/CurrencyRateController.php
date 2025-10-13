<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCurrencyRateAction;
use App\Dto\CurrencyRateDto;
use App\Http\Requests\CreateCurrencyRateRequest;
use App\Models\Currency;
use Illuminate\Http\RedirectResponse;

final class CurrencyRateController
{
    public function store(CreateCurrencyRateRequest $request, Currency $currency, CreateCurrencyRateAction $action): RedirectResponse
    {
        $validated = $request->validated();
        $validated['currency_id'] = $currency->id;

        $dto = CurrencyRateDto::fromArray($validated);

        $action->execute($currency, $dto);

        return redirect()->route('currencies.edit', $currency)
            ->with('flash', [
                'type' => 'success',
                'message' => 'Tasa de conversión agregada exitosamente.',
            ]);
    }
}
