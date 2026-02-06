<?php

declare(strict_types=1);

namespace Tests\Unit\Enum;

use App\Enums\TransactionType;

test('cases', function () {
    expect(TransactionType::cases())->toBeArray()
        ->and(TransactionType::cases())->toHaveCount(8)
        ->and(TransactionType::cases())->toBe([
            TransactionType::INCOME,
            TransactionType::EXPENSE,
            TransactionType::TRANSFER,
            TransactionType::INITIAL,
            TransactionType::TRANSFER_IN,
            TransactionType::TRANSFER_OUT,
            TransactionType::ADJUSTMENT_NEGATIVE,
            TransactionType::ADJUSTMENT_POSITIVE,
        ]);
});

test('labels', function () {
    expect(TransactionType::INCOME->label())->toBe('Ingreso');
    expect(TransactionType::EXPENSE->label())->toBe('Gasto');
    expect(TransactionType::TRANSFER->label())->toBe('Transferencia');
    expect(TransactionType::INITIAL->label())->toBe('Inicial');
    expect(TransactionType::TRANSFER_IN->label())->toBe('Transferencia entrante');
    expect(TransactionType::TRANSFER_OUT->label())->toBe('Transferencia saliente');
});
