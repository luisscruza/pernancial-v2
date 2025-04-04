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

test('emojis', function () {
    expect(AccountType::CASH->emoji())->toBe('💵');
    expect(AccountType::BANK->emoji())->toBe('🏦');
    expect(AccountType::CREDIT_CARD->emoji())->toBe('💳');
    expect(AccountType::SAVINGS->emoji())->toBe('💰');
    expect(AccountType::CHECKING->emoji())->toBe('💸');
    expect(AccountType::GENERAL->emoji())->toBe('💼');
    expect(AccountType::INVESTMENT->emoji())->toBe('💸');
});

test('colors', function () {
    expect(AccountType::CASH->color())->toBe('#bfbfbf');
    expect(AccountType::BANK->color())->toBe('#bfbfbf');
    expect(AccountType::CREDIT_CARD->color())->toBe('#FF0000');
    expect(AccountType::SAVINGS->color())->toBe('#f59e0b');
    expect(AccountType::CHECKING->color())->toBe('#0000FF');
    expect(AccountType::GENERAL->color())->toBe('#0EA5E9');
    expect(AccountType::INVESTMENT->color())->toBe('#84CC16');
});
