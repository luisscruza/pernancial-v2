<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreatePayablePaymentDto;
use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Payable;
use App\Models\PayablePayment;

final readonly class CreatePayablePaymentAction
{
    /**
     * Execute the action.
     */
    public function handle(Payable $payable, CreatePayablePaymentDto $data): PayablePayment
    {
        return $payable->getConnection()->transaction(function () use ($payable, $data): PayablePayment {
            $account = $data->account;
            $optimisticRunningBalance = $account->balance - $data->amount;
            $description = $data->note
                ? sprintf('Pago a %s: %s', $payable->contact->name, $data->note)
                : sprintf('Pago a %s', $payable->contact->name);

            $transaction = $account->transactions()->create([
                'type' => TransactionType::EXPENSE,
                'amount' => $data->amount,
                'transaction_date' => $data->paid_at,
                'description' => $description,
                'category_id' => $data->category?->id,
                'conversion_rate' => 1,
                'converted_amount' => $data->amount,
                'running_balance' => $optimisticRunningBalance,
                'ai_assisted' => false,
            ]);

            $account->update(['balance' => $optimisticRunningBalance]);

            if (! $account->currency->is_base) {
                $rate = $account->currency->rateForDate($transaction->transaction_date->toDateString());
                $transaction->update([
                    'conversion_rate' => $rate,
                    'converted_amount' => $transaction->amount * $rate,
                ]);
            }

            $payment = $payable->payments()->create([
                'account_id' => $account->id,
                'transaction_id' => $transaction->id,
                'amount' => $data->amount,
                'paid_at' => $data->paid_at,
                'note' => $data->note,
            ]);

            $nextPaid = $payable->amount_paid + $data->amount;
            $status = $nextPaid >= $payable->amount_total ? 'paid' : 'partial';

            $payable->update([
                'amount_paid' => $nextPaid,
                'status' => $status,
            ]);

            UpdateAccountBalance::dispatch($account, $transaction);

            return $payment;
        });
    }
}
