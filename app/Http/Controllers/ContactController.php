<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateContactAction;
use App\Actions\UpdateContactAction;
use App\Http\Requests\CreateContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Contact;
use App\Models\PayablePayment;
use App\Models\ReceivablePayment;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class ContactController
{
    /**
     * Display a listing of contacts.
     */
    public function index(#[CurrentUser] User $user): Response
    {
        $contacts = $user->contacts()
            ->orderBy('name')
            ->get();

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
        ]);
    }

    /**
     * Show the form for creating a new contact.
     */
    public function create(): Response
    {
        return Inertia::render('contacts/create');
    }

    /**
     * Store a newly created contact in storage.
     */
    public function store(
        CreateContactRequest $request,
        CreateContactAction $action,
        #[CurrentUser] User $user
    ): RedirectResponse {
        /** @var array{name: string, email?: string|null, phone?: string|null, notes?: string|null} $data */
        $data = $request->validated();

        $action->handle($user, $data);

        return to_route('contacts.index')->with('success', 'Contacto creado exitosamente.');
    }

    /**
     * Show the form for editing the specified contact.
     */
    public function edit(Contact $contact): Response
    {
        return Inertia::render('contacts/edit', [
            'contact' => $contact->only(['id', 'name', 'email', 'phone', 'notes']),
        ]);
    }

    /**
     * Display the specified contact.
     */
    public function show(Contact $contact): Response
    {
        $contact->load(['receivables.currency', 'payables.currency']);

        $receivables = $contact->receivables()->with('currency')->orderBy('due_date', 'desc')->get();
        $payables = $contact->payables()->with('currency')->orderBy('due_date', 'desc')->get();

        $receivablePayments = ReceivablePayment::query()
            ->whereHas('receivable', fn ($query) => $query->where('contact_id', $contact->id))
            ->with(['transaction.account.currency'])
            ->get();

        $payablePayments = PayablePayment::query()
            ->whereHas('payable', fn ($query) => $query->where('contact_id', $contact->id))
            ->with(['transaction.account.currency'])
            ->get();

        $transactions = $receivablePayments
            ->merge($payablePayments)
            ->filter(fn ($payment) => $payment->transaction)
            ->map(fn ($payment) => $payment->transaction)
            ->sortByDesc('transaction_date')
            ->values();

        $owedToYou = $receivables->sum(function ($receivable): float {
            $rate = $receivable->currency?->is_base ? 1.0 : (float) $receivable->currency?->currentRate();
            $pending = (float) $receivable->amount_total - (float) $receivable->amount_paid;

            return $pending * ($rate ?: 1.0);
        });

        $youOwe = $payables->sum(function ($payable): float {
            $rate = $payable->currency?->is_base ? 1.0 : (float) $payable->currency?->currentRate();
            $pending = (float) $payable->amount_total - (float) $payable->amount_paid;

            return $pending * ($rate ?: 1.0);
        });

        return Inertia::render('contacts/show', [
            'contact' => $contact->only(['id', 'name', 'email', 'phone', 'notes']),
            'receivables' => $receivables,
            'payables' => $payables,
            'transactions' => $transactions,
            'totals' => [
                'owed_to_you' => $owedToYou,
                'you_owe' => $youOwe,
            ],
        ]);
    }

    /**
     * Update the specified contact in storage.
     */
    public function update(
        UpdateContactRequest $request,
        UpdateContactAction $action,
        Contact $contact
    ): RedirectResponse {
        /** @var array{name: string, email?: string|null, phone?: string|null, notes?: string|null} $data */
        $data = $request->validated();

        $action->handle($contact, $data);

        return to_route('contacts.index')->with('success', 'Contacto actualizado exitosamente.');
    }
}
