<?php

declare(strict_types=1);

namespace Tests\Unit\Enum;

use App\Enums\AccountType;

test('cases', function () {
    expect(AccountType::cases())->toBeArray()
        ->and(AccountType::cases())->toHaveCount(7)
        ->and(AccountType::cases())->toBe([
            AccountType::SAVINGS,
            AccountType::CHECKING,
            AccountType::CASH,
            AccountType::BANK,
            AccountType::CREDIT_CARD,
            AccountType::GENERAL,
            AccountType::INVESTMENT,
        ]);
});

test('labels', function () {
    expect(AccountType::CASH->label())->toBe('Efectivo');
    expect(AccountType::BANK->label())->toBe('Banco');
    expect(AccountType::CREDIT_CARD->label())->toBe('Tarjeta de crédito');
    expect(AccountType::SAVINGS->label())->toBe('Ahorro');
    expect(AccountType::CHECKING->label())->toBe('Cuenta corriente');
    expect(AccountType::GENERAL->label())->toBe('General');
    expect(AccountType::INVESTMENT->label())->toBe('Inversión');
});
