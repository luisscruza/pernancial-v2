<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateTransactionAction;
use App\Actions\DeleteTransactionAction;
use App\Actions\UpdateTransactionAction;
use App\Http\Requests\CreateTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;

final class TransactionController
{
    /**
     * Store a newly created transaction in storage.
     */
    public function store(
        CreateTransactionRequest $request,
        CreateTransactionAction $action,
        Account $account
    ): RedirectResponse {
        $data = $request->getDto();

        $action->handle($account, $data);

        return back()->with('success', 'Transacción creada exitosamente.');
    }

    /**
     * Update the specified transaction in storage.
     */
    public function update(
        UpdateTransactionRequest $request,
        UpdateTransactionAction $action,
        Account $account,
        Transaction $transaction
    ): RedirectResponse {
        $data = $request->getDto();

        $action->handle($transaction, $data);

        return back()->with('success', 'Transacción actualizada exitosamente.');
    }

    /**
     * Remove the specified transaction from storage.
     */
    public function destroy(
        DeleteTransactionAction $action,
        Account $account,
        Transaction $transaction
    ): RedirectResponse {
        $action->handle($transaction);

        return back()->with('success', 'Transacción eliminada exitosamente.');
    }
}
