<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Payable;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

it('creates a payable from the store endpoint', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create(['is_base' => true, 'conversion_rate' => 1]);
    $user->update(['base_currency_id' => $currency->id]);
    $contact = Contact::factory()->for($user)->create();
    Account::factory()->for($user)->create(['currency_id' => $currency->id]);

    actingAs($user);

    $response = post(route('payables.store'), [
        'contact_id' => $contact->id,
        'currency_id' => $currency->id,
        'amount_total' => 150,
        'due_date' => now()->addDays(3)->toDateString(),
        'description' => 'Proveedor',
        'is_recurring' => false,
    ]);

    $response->assertSessionHasNoErrors();

    expect(Payable::query()->count())->toBe(1);
});

it('shows the payables index page', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    Payable::factory()->for($user)->for($contact)->for($currency)->create();
    Payable::factory()->for($user)->for($contact)->for($currency)->create([
        'status' => 'paid',
        'amount_paid' => 200,
    ]);

    actingAs($user);

    get(route('payables.index'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('payables/index')
                ->has('payables.data', 1)
                ->has('accounts', 1)
                ->where('filters.status', 'unpaid')
        );
});

it('filters payables by contact', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $contactA = Contact::factory()->for($user)->create();
    $contactB = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    Payable::factory()->for($user)->for($contactA)->for($currency)->create();
    Payable::factory()->for($user)->for($contactA)->for($currency)->create([
        'status' => 'paid',
        'amount_paid' => 300,
    ]);
    Payable::factory()->for($user)->for($contactB)->for($currency)->create();

    actingAs($user);

    get(route('payables.index', ['contact_id' => $contactA->id]))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('payables/index')
                ->has('payables.data', 1)
                ->has('contacts', 2)
                ->where('filters.contact_id', $contactA->id)
                ->where('filters.status', 'unpaid')
        );
});

it('shows the payable detail page', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    $payable = Payable::factory()->for($user)->for($contact)->for($currency)->create();

    actingAs($user);

    get(route('payables.show', $payable))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('payables/show')
                ->where('payable.id', $payable->id)
                ->has('accounts', 1)
        );
});
