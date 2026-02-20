<?php

declare(strict_types=1);

use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Receivable;
use App\Models\ReceivablePayment;
use App\Models\Transaction;
use App\Models\User;

it('creates a shared expense with receivables and payments', function () {
    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true, 'conversion_rate' => 1]);
    $user->update(['base_currency_id' => $currency->id]);

    $account = Account::factory()->for($user)->create(['currency_id' => $currency->id, 'balance' => 1000]);
    $receivingAccount = Account::factory()->for($user)->create(['currency_id' => $currency->id, 'balance' => 0]);

    $category = Category::factory()->for($user)->create(['type' => CategoryType::EXPENSE->value]);

    $contactOne = Contact::factory()->for($user)->create();
    $contactTwo = Contact::factory()->for($user)->create();

    $response = $this->actingAs($user)->post(route('transactions.store', $account->uuid), [
        'type' => TransactionType::EXPENSE->value,
        'amount' => 100,
        'personal_amount' => 34,
        'description' => 'Cena con amigos',
        'category_id' => $category->id,
        'transaction_date' => now()->toDateString(),
        'is_shared' => true,
        'shared_receivables' => [
            [
                'contact_id' => $contactOne->id,
                'amount' => 33,
                'paid_account_id' => $receivingAccount->id,
            ],
            [
                'contact_id' => $contactTwo->id,
                'amount' => 33,
            ],
        ],
    ]);

    $response->assertSessionHasNoErrors();

    $expense = Transaction::query()
        ->where('account_id', $account->id)
        ->where('type', TransactionType::EXPENSE)
        ->latest('id')
        ->first();

    expect($expense)->not->toBeNull();
    expect($expense?->amount)->toBe(100.0);
    expect($expense?->personal_amount)->toBe(34.0);

    $receivables = Receivable::query()->where('origin_transaction_id', $expense->id)->get();
    expect($receivables)->toHaveCount(2);

    $paidReceivable = $receivables->firstWhere('contact_id', $contactOne->id);
    expect($paidReceivable)->not->toBeNull();
    expect($paidReceivable?->status)->toBe('paid');
    expect($paidReceivable?->amount_paid)->toBe(33.0);

    $payment = ReceivablePayment::query()->where('receivable_id', $paidReceivable->id)->first();
    expect($payment)->not->toBeNull();

    $income = Transaction::query()->find($payment->transaction_id);
    expect($income)->not->toBeNull();
    expect($income?->type)->toBe(TransactionType::INCOME);
});
