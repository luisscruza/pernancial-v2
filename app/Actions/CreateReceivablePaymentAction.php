<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateReceivablePaymentDto;
use App\Enums\TransactionType;
use App\Jobs\UpdateAccountBalance;
use App\Models\Receivable;
use App\Models\ReceivablePayment;

final readonly class CreateReceivablePaymentAction
{
    /**
     * Execute the action.
     */
    public function handle(Receivable $receivable, CreateReceivablePaymentDto $data): ReceivablePayment
    {
        return $receivable->getConnection()->transaction(function () use ($receivable, $data): ReceivablePayment {
            $account = $data->account;
            $optimisticRunningBalance = $account->balance + $data->amount;
            $description = $data->note
                ? sprintf('Cobro de %s: %s', $receivable->contact->name, $data->note)
                : sprintf('Cobro de %s', $receivable->contact->name);

            $transaction = $account->transactions()->create([
                'type' => TransactionType::INCOME,
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

            $payment = $receivable->payments()->create([
                'account_id' => $account->id,
                'transaction_id' => $transaction->id,
                'amount' => $data->amount,
                'paid_at' => $data->paid_at,
                'note' => $data->note,
            ]);

            $nextPaid = $receivable->amount_paid + $data->amount;
            $status = $nextPaid >= $receivable->amount_total ? 'paid' : 'partial';

            $receivable->update([
                'amount_paid' => $nextPaid,
                'status' => $status,
            ]);

            UpdateAccountBalance::dispatch($account, $transaction);

            return $payment;
        });
    }
}
