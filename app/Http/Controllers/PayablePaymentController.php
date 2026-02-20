<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreatePayablePaymentAction;
use App\Http\Requests\StorePayablePaymentRequest;
use App\Models\Payable;
use Illuminate\Http\RedirectResponse;

final class PayablePaymentController
{
    /**
     * Store a newly created payment for a payable.
     */
    public function store(
        StorePayablePaymentRequest $request,
        CreatePayablePaymentAction $action,
        Payable $payable
    ): RedirectResponse {
        $action->handle($payable, $request->getDto());

        return back()->with('success', 'Pago registrado exitosamente.');
    }
}
