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
    Payable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 100,
        'amount_paid' => 20,
        'due_date' => now()->addDays(3)->toDateString(),
    ]);
    Payable::factory()->for($user)->for($contact)->for($currency)->create([
        'status' => 'paid',
        'amount_total' => 200,
        'amount_paid' => 200,
        'due_date' => now()->subDays(2)->toDateString(),
    ]);

    actingAs($user);

    get(route('payables.index'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('payables/index')
                ->has('payables.data', 1)
                ->has('accounts', 1)
                ->where('summary.pending_count', 1)
                ->where('summary.pending_amount', 80)
                ->where('summary.paid_count', 1)
                ->where('summary.paid_amount', 200)
                ->where('summary.overdue_count', 0)
                ->where('summary.due_today_count', 0)
                ->where('summary.due_soon_count', 1)
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
    Payable::factory()->for($user)->for($contactA)->for($currency)->create([
        'amount_total' => 120,
        'amount_paid' => 20,
        'due_date' => now()->addDays(1)->toDateString(),
    ]);
    Payable::factory()->for($user)->for($contactA)->for($currency)->create([
        'status' => 'paid',
        'amount_total' => 300,
        'amount_paid' => 300,
        'due_date' => now()->subDays(1)->toDateString(),
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
                ->where('summary.pending_count', 1)
                ->where('summary.paid_count', 1)
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

it('shows the payable edit page', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    $payable = Payable::factory()->for($user)->for($contact)->for($currency)->create();

    actingAs($user);

    get(route('payables.edit', $payable))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('payables/edit')
                ->where('payable.id', $payable->id)
                ->has('contacts', 1)
                ->has('currencies', 1)
        );
});

it('updates a payable', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $newCurrency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();
    $newContact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    $payable = Payable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 200,
        'amount_paid' => 50,
        'status' => 'partial',
    ]);

    actingAs($user);

    $response = post(route('payables.update', $payable), [
        '_method' => 'PUT',
        'contact_id' => $newContact->id,
        'currency_id' => $newCurrency->id,
        'amount_total' => 180,
        'due_date' => now()->addDays(10)->toDateString(),
        'description' => 'Actualizado',
    ]);

    $response->assertRedirect(route('payables.show', $payable));

    $payable->refresh();
    expect($payable->contact_id)->toBe($newContact->id)
        ->and($payable->currency_id)->toBe($newCurrency->id)
        ->and($payable->amount_total)->toBe(180.0)
        ->and($payable->description)->toBe('Actualizado')
        ->and($payable->status)->toBe('partial');
});
