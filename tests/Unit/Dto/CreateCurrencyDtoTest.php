<?php

declare(strict_types=1);

use App\Dto\CreateCurrencyDto;

test('can create dto from array', function () {
    $data = [
        'code' => 'USD',
        'name' => 'US Dollar',
        'symbol' => '$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 1.0,
        'is_base' => true,
    ];

    $dto = CreateCurrencyDto::fromArray($data);

    expect($dto->code)->toBe('USD')
        ->and($dto->name)->toBe('US Dollar')
        ->and($dto->symbol)->toBe('$')
        ->and($dto->decimalPlaces)->toBe(2)
        ->and($dto->decimalSeparator)->toBe('.')
        ->and($dto->thousandsSeparator)->toBe(',')
        ->and($dto->symbolPosition)->toBe('before')
        ->and($dto->conversionRate)->toBe(1.0)
        ->and($dto->isBase)->toBe(true);
});

test('can create dto from array with default is_base', function () {
    $data = [
        'code' => 'EUR',
        'name' => 'Euro',
        'symbol' => '€',
        'decimal_places' => 2,
        'decimal_separator' => ',',
        'thousands_separator' => '.',
        'symbol_position' => 'after',
        'conversion_rate' => 0.85,
    ];

    $dto = CreateCurrencyDto::fromArray($data);

    expect($dto->code)->toBe('EUR')
        ->and($dto->name)->toBe('Euro')
        ->and($dto->symbol)->toBe('€')
        ->and($dto->decimalPlaces)->toBe(2)
        ->and($dto->decimalSeparator)->toBe(',')
        ->and($dto->thousandsSeparator)->toBe('.')
        ->and($dto->symbolPosition)->toBe('after')
        ->and($dto->conversionRate)->toBe(0.85)
        ->and($dto->isBase)->toBe(false); // Should default to false
});

test('can create dto directly', function () {
    $dto = new CreateCurrencyDto(
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        decimalPlaces: 2,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        symbolPosition: 'before',
        conversionRate: 1.25,
        isBase: false,
    );

    expect($dto->code)->toBe('GBP')
        ->and($dto->name)->toBe('British Pound')
        ->and($dto->symbol)->toBe('£')
        ->and($dto->decimalPlaces)->toBe(2)
        ->and($dto->decimalSeparator)->toBe('.')
        ->and($dto->thousandsSeparator)->toBe(',')
        ->and($dto->symbolPosition)->toBe('before')
        ->and($dto->conversionRate)->toBe(1.25)
        ->and($dto->isBase)->toBe(false);
});

test('can convert dto to array', function () {
    $originalData = [
        'code' => 'JPY',
        'name' => 'Japanese Yen',
        'symbol' => '¥',
        'decimal_places' => 0,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 110.0,
        'is_base' => false,
    ];

    $dto = CreateCurrencyDto::fromArray($originalData);
    $arrayData = $dto->toArray();

    expect($arrayData)->toBe([
        'code' => 'JPY',
        'name' => 'Japanese Yen',
        'symbol' => '¥',
        'decimal_places' => 0,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 110.0,
        'is_base' => false,
    ]);
});

test('toArray returns correct structure when created directly', function () {
    $dto = new CreateCurrencyDto(
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        decimalPlaces: 2,
        decimalSeparator: '.',
        thousandsSeparator: ',',
        symbolPosition: 'before',
        conversionRate: 0.75,
        isBase: true,
    );

    $arrayData = $dto->toArray();

    expect($arrayData)->toBe([
        'code' => 'CAD',
        'name' => 'Canadian Dollar',
        'symbol' => 'C$',
        'decimal_places' => 2,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 0.75,
        'is_base' => true,
    ]);
});

test('handles different data types correctly', function () {
    $data = [
        'code' => 'BTC',
        'name' => 'Bitcoin',
        'symbol' => '₿',
        'decimal_places' => 8,
        'decimal_separator' => '.',
        'thousands_separator' => ',',
        'symbol_position' => 'before',
        'conversion_rate' => 45000.123456,
        'is_base' => false,
    ];

    $dto = CreateCurrencyDto::fromArray($data);

    expect($dto->decimalPlaces)->toBeInt()
        ->and($dto->conversionRate)->toBeFloat()
        ->and($dto->isBase)->toBeBool()
        ->and($dto->code)->toBeString()
        ->and($dto->name)->toBeString()
        ->and($dto->symbol)->toBeString()
        ->and($dto->decimalSeparator)->toBeString()
        ->and($dto->thousandsSeparator)->toBeString()
        ->and($dto->symbolPosition)->toBeString();
});
