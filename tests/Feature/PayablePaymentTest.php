<?php

declare(strict_types=1);

use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Payable;
use App\Models\Transaction;
use App\Models\User;

it('registers a payable payment and creates an expense transaction', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true, 'conversion_rate' => 1]);
    $user->update(['base_currency_id' => $currency->id]);

    $account = Account::factory()->for($user)->create(['currency_id' => $currency->id, 'balance' => 500]);
    $contact = Contact::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create(['type' => CategoryType::EXPENSE]);

    $payable = Payable::factory()->for($user)->create([
        'contact_id' => $contact->id,
        'currency_id' => $currency->id,
        'amount_total' => 100,
        'amount_paid' => 0,
        'status' => 'open',
    ]);

    $response = $this->actingAs($user)->post(route('payables.payments.store', $payable->id), [
        'account_id' => $account->id,
        'amount' => 40,
        'paid_at' => now()->toDateString(),
        'note' => 'Primer pago',
        'category_id' => $category->id,
    ]);

    $response->assertSessionHasNoErrors();

    $payable->refresh();
    expect($payable->amount_paid)->toBe(40.0);
    expect($payable->status)->toBe('partial');

    $transaction = Transaction::query()->latest('id')->first();
    expect($transaction)->not->toBeNull();
    expect($transaction?->type)->toBe(TransactionType::EXPENSE);
    expect($transaction?->category_id)->toBe($category->id);
});
