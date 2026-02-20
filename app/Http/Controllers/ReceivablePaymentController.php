<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateReceivablePaymentAction;
use App\Http\Requests\StoreReceivablePaymentRequest;
use App\Models\Receivable;
use Illuminate\Http\RedirectResponse;

final class ReceivablePaymentController
{
    /**
     * Store a newly created payment for a receivable.
     */
    public function store(
        StoreReceivablePaymentRequest $request,
        CreateReceivablePaymentAction $action,
        Receivable $receivable
    ): RedirectResponse {
        $action->handle($receivable, $request->getDto());

        return back()->with('success', 'Pago registrado exitosamente.');
    }
}
