<?php

declare(strict_types=1);

use App\Actions\DeleteTransactionAction;
use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Account;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Currency;
use App\Models\Payable;
use App\Models\PayablePayment;
use App\Models\Receivable;
use App\Models\ReceivablePayment;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('deletes linked receivable payments and updates receivable status', function () {
    Queue::fake();

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true]);
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    $transaction = Transaction::factory()->for($account)->create([
        'type' => TransactionType::EXPENSE->value,
        'category_id' => $category->id,
    ]);

    $receivable = Receivable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 100.00,
        'amount_paid' => 50.00,
        'status' => 'partial',
    ]);

    $payment = ReceivablePayment::factory()->for($receivable)->for($account)->create([
        'transaction_id' => $transaction->id,
        'amount' => 50.00,
    ]);

    $action = app(DeleteTransactionAction::class);
    $action->handle($transaction);

    $this->assertDatabaseMissing('receivable_payments', ['id' => $payment->id]);
    $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);

    $receivable->refresh();

    expect($receivable->amount_paid)->toBe(0.0)
        ->and($receivable->status)->toBe('open');

    Queue::assertPushed(UpdateAccountBalance::class, 1);
});

it('deletes linked payable payments and updates payable status', function () {
    Queue::fake();

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true]);
    $account = Account::factory()->for($user)->for($currency)->create();
    $category = Category::factory()->for($user)->create();
    $contact = Contact::factory()->for($user)->create();

    $transaction = Transaction::factory()->for($account)->create([
        'type' => TransactionType::EXPENSE->value,
        'category_id' => $category->id,
    ]);

    $payable = Payable::factory()->for($user)->for($contact)->for($currency)->create([
        'amount_total' => 200.00,
        'amount_paid' => 200.00,
        'status' => 'paid',
    ]);

    $payment = PayablePayment::factory()->for($payable)->for($account)->create([
        'transaction_id' => $transaction->id,
        'amount' => 200.00,
    ]);

    $action = app(DeleteTransactionAction::class);
    $action->handle($transaction);

    $this->assertDatabaseMissing('payable_payments', ['id' => $payment->id]);
    $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);

    $payable->refresh();

    expect($payable->amount_paid)->toBe(0.0)
        ->and($payable->status)->toBe('open');

    Queue::assertPushed(UpdateAccountBalance::class, 1);
});

it('deletes transfer transactions together', function () {
    Queue::fake();

    $user = User::factory()->create();
    $currency = Currency::factory()->for($user)->create(['is_base' => true]);
    $fromAccount = Account::factory()->for($user)->for($currency)->create();
    $toAccount = Account::factory()->for($user)->for($currency)->create();

    $outTransaction = Transaction::factory()->for($fromAccount)->create([
        'type' => TransactionType::TRANSFER_OUT->value,
        'amount' => 75.00,
        'destination_account_id' => $toAccount->id,
        'category_id' => null,
    ]);

    $inTransaction = Transaction::factory()->for($toAccount)->create([
        'type' => TransactionType::TRANSFER_IN->value,
        'amount' => 75.00,
        'from_account_id' => $fromAccount->id,
        'destination_account_id' => null,
        'category_id' => null,
    ]);

    $outTransaction->update(['related_transaction_id' => $inTransaction->id]);
    $inTransaction->update(['related_transaction_id' => $outTransaction->id]);

    $action = app(DeleteTransactionAction::class);
    $action->handle($outTransaction);

    $this->assertDatabaseMissing('transactions', ['id' => $outTransaction->id]);
    $this->assertDatabaseMissing('transactions', ['id' => $inTransaction->id]);

    Queue::assertPushed(UpdateAccountBalance::class, 2);
});
