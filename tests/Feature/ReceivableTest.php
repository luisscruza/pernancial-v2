<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Receivable;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

it('shows the receivables index page', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    Receivable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 140,
        'amount_paid' => 40,
        'due_date' => now()->addDays(2)->toDateString(),
    ]);
    Receivable::factory()->for($user)->for($contact)->for($currency)->create([
        'status' => 'paid',
        'amount_total' => 200,
        'amount_paid' => 200,
        'due_date' => now()->subDays(3)->toDateString(),
    ]);

    actingAs($user);

    get(route('receivables.index'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('receivables/index')
                ->has('receivables.data', 1)
                ->has('accounts', 1)
                ->where('summary.pending_count', 1)
                ->where('summary.pending_amount', 100)
                ->where('summary.paid_count', 1)
                ->where('summary.paid_amount', 200)
                ->where('summary.overdue_count', 0)
                ->where('summary.due_today_count', 0)
                ->where('summary.due_soon_count', 1)
                ->where('filters.status', 'unpaid')
        );
});

it('filters receivables by contact', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $contactA = Contact::factory()->for($user)->create();
    $contactB = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    Receivable::factory()->for($user)->for($contactA)->for($currency)->create([
        'amount_total' => 160,
        'amount_paid' => 60,
        'due_date' => now()->addDays(1)->toDateString(),
    ]);
    Receivable::factory()->for($user)->for($contactA)->for($currency)->create([
        'status' => 'paid',
        'amount_total' => 300,
        'amount_paid' => 300,
        'due_date' => now()->subDays(1)->toDateString(),
    ]);
    Receivable::factory()->for($user)->for($contactB)->for($currency)->create();

    actingAs($user);

    get(route('receivables.index', ['contact_id' => $contactA->id]))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('receivables/index')
                ->has('receivables.data', 1)
                ->has('contacts', 2)
                ->where('summary.pending_count', 1)
                ->where('summary.paid_count', 1)
                ->where('filters.contact_id', $contactA->id)
                ->where('filters.status', 'unpaid')
        );
});

it('shows the receivable edit page', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    $receivable = Receivable::factory()->for($user)->for($contact)->for($currency)->create();

    actingAs($user);

    get(route('receivables.edit', $receivable))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('receivables/edit')
                ->where('receivable.id', $receivable->id)
                ->has('contacts', 1)
                ->has('currencies', 1)
        );
});

it('updates a receivable', function () {
    /** @var User $user */
    $user = User::factory()->createOne();
    $currency = Currency::factory()->for($user)->create();
    $newCurrency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();
    $newContact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    $receivable = Receivable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 200,
        'amount_paid' => 50,
        'status' => 'partial',
    ]);

    actingAs($user);

    $response = post(route('receivables.update', $receivable), [
        '_method' => 'PUT',
        'contact_id' => $newContact->id,
        'currency_id' => $newCurrency->id,
        'amount_total' => 180,
        'due_date' => now()->addDays(10)->toDateString(),
        'description' => 'Actualizado',
    ]);

    $response->assertRedirect(route('receivables.show', $receivable));

    $receivable->refresh();
    expect($receivable->contact_id)->toBe($newContact->id)
        ->and($receivable->currency_id)->toBe($newCurrency->id)
        ->and($receivable->amount_total)->toBe(180.0)
        ->and($receivable->description)->toBe('Actualizado')
        ->and($receivable->status)->toBe('partial');
});
