<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateTransactionAction;
use App\Http\Requests\CreateTransactionRequest;
use App\Models\Account;
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
}
