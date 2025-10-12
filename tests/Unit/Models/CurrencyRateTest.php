<?php

declare(strict_types=1);

use App\Models\Currency;
use App\Models\CurrencyRate;

test('to array', function () {
    $currencyRate = CurrencyRate::factory()->create()->fresh();

    expect(array_keys($currencyRate->toArray()))->toBe([
        'id',
        'user_id',
        'currency_id',
        'rate',
        'effective_date',
        'created_at',
        'updated_at',
    ]);
});

it('belongs to currency', function () {
    $currencyRate = CurrencyRate::factory()->create()->fresh();

    expect($currencyRate->currency)->toBeInstanceOf(Currency::class);
});
