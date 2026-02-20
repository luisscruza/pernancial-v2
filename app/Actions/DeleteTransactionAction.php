<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\PayablePayment;
use App\Models\ReceivablePayment;
use App\Models\Transaction;

final readonly class DeleteTransactionAction
{
    /**
     * Execute the action.
     */
    public function handle(Transaction $transaction): void
    {
        $transaction->getConnection()->transaction(function () use ($transaction): void {

            $account = $transaction->account;

            $receivablePayment = ReceivablePayment::query()
                ->where('transaction_id', $transaction->id)
                ->with('receivable')
                ->first();

            if ($receivablePayment && $receivablePayment->receivable) {
                $receivable = $receivablePayment->receivable;
                $nextPaid = max(0, $receivable->amount_paid - $receivablePayment->amount);
                $status = $nextPaid <= 0
                    ? 'open'
                    : ($nextPaid >= $receivable->amount_total ? 'paid' : 'partial');

                $receivable->update([
                    'amount_paid' => $nextPaid,
                    'status' => $status,
                ]);

                $receivablePayment->delete();
            }

            $payablePayment = PayablePayment::query()
                ->where('transaction_id', $transaction->id)
                ->with('payable')
                ->first();

            if ($payablePayment && $payablePayment->payable) {
                $payable = $payablePayment->payable;
                $nextPaid = max(0, $payable->amount_paid - $payablePayment->amount);
                $status = $nextPaid <= 0
                    ? 'open'
                    : ($nextPaid >= $payable->amount_total ? 'paid' : 'partial');

                $payable->update([
                    'amount_paid' => $nextPaid,
                    'status' => $status,
                ]);

                $payablePayment->delete();
            }

            // Check if this is a transfer transaction with a related transaction
            if (
                ($transaction->type === TransactionType::TRANSFER_OUT || $transaction->type === TransactionType::TRANSFER_IN) &&
                $transaction->related_transaction_id
            ) {
                /** @var Transaction|null $relatedTransaction */
                $relatedTransaction = Transaction::find($transaction->related_transaction_id);

                if ($relatedTransaction) {
                    $relatedAccount = $relatedTransaction->account;
                    $relatedTransaction->delete();

                    // Recalculate balances for the related account asynchronously
                    UpdateAccountBalance::dispatch($relatedAccount, null);
                }
            }

            // Delete the main transaction
            $transaction->delete();

            // Recalculate balances for the main account asynchronously
            UpdateAccountBalance::dispatch($account, null);
        });
    }
}
