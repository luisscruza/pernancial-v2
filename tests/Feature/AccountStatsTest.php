<?php

declare(strict_types=1);

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Payable;
use App\Models\Receivable;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('calculates filtered and unfiltered totals for account stats', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create([
        'is_base' => true,
        'conversion_rate' => 1,
    ]);

    $user->update(['base_currency_id' => $currency->id]);

    Account::factory()->for($user)->for($currency)->create([
        'balance' => 1000,
        'type' => AccountType::CASH,
    ]);

    Account::factory()->for($user)->for($currency)->create([
        'balance' => -200,
        'type' => AccountType::CREDIT_CARD,
    ]);

    $contact = Contact::factory()->for($user)->create();

    Receivable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 200,
        'amount_paid' => 50,
        'due_date' => now()->endOfMonth()->subDays(2)->toDateString(),
    ]);

    Receivable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 300,
        'amount_paid' => 0,
        'due_date' => now()->endOfMonth()->addDays(2)->toDateString(),
    ]);

    Payable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 100,
        'amount_paid' => 20,
        'due_date' => now()->endOfMonth()->subDays(1)->toDateString(),
    ]);

    Payable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 400,
        'amount_paid' => 0,
        'due_date' => now()->endOfMonth()->addDays(5)->toDateString(),
    ]);

    actingAs($user);

    get(route('accounts'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('accounts/index')
                ->where('accountingStats.cuentasPorCobrar', 150)
                ->where('accountingStats.cuentasPorPagar', -80)
                ->where('accountingStats.cuentasPorCobrarTotal', 450)
                ->where('accountingStats.cuentasPorPagarTotal', -480)
                ->where('accountingStats.creditCardDebt', -200)
                ->where('accountingStats.totalGeneral', 870)
                ->where('accountingStats.totalGeneralSinFiltro', 770)
        );
});
