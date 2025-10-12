<?php

declare(strict_types=1);

namespace Tests\Unit\Enum;

use App\Enums\CategoryType;

test('cases', function () {
    expect(CategoryType::cases())->toBeArray()
        ->and(CategoryType::cases())->toHaveCount(2)
        ->and(CategoryType::cases())->toBe([
            CategoryType::INCOME,
            CategoryType::EXPENSE,
        ]);
});

test('labels', function () {
    expect(CategoryType::INCOME->label())->toBe('Ingreso');
    expect(CategoryType::EXPENSE->label())->toBe('Gasto');
});
