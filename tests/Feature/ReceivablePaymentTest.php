<?php

declare(strict_types=1);

use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Receivable;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('user can view receivables index page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    Receivable::factory()->for($user)->for($contact)->for($currency)->create();

    $response = $this->actingAs($user)->get(route('receivables.index'));

    $response->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('receivables/index')
                ->has('receivables.data', 1)
                ->has('accounts', 1)
                ->has('categories')
        );
});

test('user can view receivable detail page', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    Account::factory()->for($user)->for($currency)->create();
    $receivable = Receivable::factory()->for($user)->for($contact)->for($currency)->create();

    $this->actingAs($user)->get(route('receivables.show', $receivable))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('receivables/show')
                ->where('receivable.id', $receivable->id)
                ->has('accounts', 1)
                ->has('categories')
        );
});

it('registers a receivable payment and creates an income transaction with category', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true, 'conversion_rate' => 1]);
    $user->update(['base_currency_id' => $currency->id]);

    $account = Account::factory()->for($user)->create(['currency_id' => $currency->id, 'balance' => 500]);
    $contact = Contact::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => CategoryType::INCOME]);

    $receivable = Receivable::factory()->for($user)->create([
        'contact_id' => $contact->id,
        'currency_id' => $currency->id,
        'amount_total' => 120,
        'amount_paid' => 0,
        'status' => 'open',
    ]);

    $response = $this->actingAs($user)->post(route('receivables.payments.store', $receivable->id), [
        'account_id' => $account->id,
        'amount' => 50,
        'paid_at' => now()->toDateString(),
        'note' => 'Primer cobro',
        'category_id' => $category->id,
    ]);

    $response->assertSessionHasNoErrors();

    $receivable->refresh();
    expect($receivable->amount_paid)->toBe(50.0);
    expect($receivable->status)->toBe('partial');

    $transaction = Transaction::query()->latest('id')->first();
    expect($transaction)->not->toBeNull();
    expect($transaction?->type)->toBe(TransactionType::INCOME);
    expect($transaction?->category_id)->toBe($category->id);
});
