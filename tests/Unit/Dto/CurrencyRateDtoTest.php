<?php

declare(strict_types=1);

use App\Dto\CurrencyRateDto;

test('can create CurrencyRateDto from array', function () {
    $data = [
        'currency_id' => 1,
        'rate' => 1.25,
        'effective_date' => '2024-07-13',
    ];

    $dto = CurrencyRateDto::fromArray($data);

    expect($dto->currencyId)->toBe(1)
        ->and($dto->rate)->toBe(1.25)
        ->and($dto->effectiveDate)->toBe('2024-07-13');
});

test('can create CurrencyRateDto directly', function () {
    $dto = new CurrencyRateDto(
        currencyId: 5,
        rate: 0.85,
        effectiveDate: '2024-06-01',
    );

    expect($dto->currencyId)->toBe(5)
        ->and($dto->rate)->toBe(0.85)
        ->and($dto->effectiveDate)->toBe('2024-06-01');
});

test('can convert CurrencyRateDto to array', function () {
    $originalData = [
        'currency_id' => 3,
        'rate' => 110.50,
        'effective_date' => '2024-05-15',
    ];

    $dto = CurrencyRateDto::fromArray($originalData);
    $arrayData = $dto->toArray();

    expect($arrayData)->toBe([
        'currency_id' => 3,
        'rate' => 110.50,
        'effective_date' => '2024-05-15',
    ]);
});

test('toArray returns correct structure when created directly', function () {
    $dto = new CurrencyRateDto(
        currencyId: 10,
        rate: 2.75,
        effectiveDate: '2024-08-20',
    );

    $arrayData = $dto->toArray();

    expect($arrayData)->toBe([
        'currency_id' => 10,
        'rate' => 2.75,
        'effective_date' => '2024-08-20',
    ]);
});

test('handles different data types correctly', function () {
    $data = [
        'currency_id' => 100,
        'rate' => 999.999999,
        'effective_date' => '2024-12-31',
    ];

    $dto = CurrencyRateDto::fromArray($data);

    expect($dto->currencyId)->toBeInt()
        ->and($dto->rate)->toBeFloat()
        ->and($dto->effectiveDate)->toBeString();
});

test('handles very precise decimal rates', function () {
    $data = [
        'currency_id' => 1,
        'rate' => 1.234567890123,
        'effective_date' => '2024-01-01',
    ];

    $dto = CurrencyRateDto::fromArray($data);
    $arrayData = $dto->toArray();

    expect($dto->rate)->toBe(1.234567890123)
        ->and($arrayData['rate'])->toBe(1.234567890123);
});

test('roundtrip conversion preserves data integrity', function () {
    $originalData = [
        'currency_id' => 42,
        'rate' => 0.0001,
        'effective_date' => '2023-12-25',
    ];

    $dto = CurrencyRateDto::fromArray($originalData);
    $convertedData = $dto->toArray();

    expect($convertedData)->toBe($originalData);
});