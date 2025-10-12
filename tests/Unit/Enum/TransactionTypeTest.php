<?php

declare(strict_types=1);

namespace Tests\Unit\Enum;

use App\Enums\TransactionType;

test('cases', function () {
    expect(TransactionType::cases())->toBeArray()
        ->and(TransactionType::cases())->toHaveCount(4)
        ->and(TransactionType::cases())->toBe([
            TransactionType::INCOME,
            TransactionType::EXPENSE,
            TransactionType::TRANSFER,
            TransactionType::INITIAL,
        ]);
});

test('labels', function () {
    expect(TransactionType::INCOME->label())->toBe('Ingreso');
    expect(TransactionType::EXPENSE->label())->toBe('Gasto');
    expect(TransactionType::TRANSFER->label())->toBe('Transferencia');
    expect(TransactionType::INITIAL->label())->toBe('Inicial');
});
