<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateAccountAction;
use App\Actions\UpdateAccountAction;
use App\Enums\AccountType;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Http\Requests\CreateAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Models\Category;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AccountController
{
    /**
     * Display a listing of the resource.
     */
    public function index(#[CurrentUser] User $user): Response
    {
        $accounts = Account::query()
            ->where('is_active', true)
            ->with('currency')
            ->get();

        $balanceEnCuenta = $accounts
            ->where('accounting_type', 'normal')
            ->sum('balance_in_base');

        $receivables = $user->receivables()->with('currency')->get();
        $payables = $user->payables()->with('currency')->get();

        $cuentasPorCobrar = $receivables->sum(function ($receivable): float {
            $rate = $receivable->currency?->is_base ? 1.0 : (float) $receivable->currency?->currentRate();
            $pending = (float) $receivable->amount_total - (float) $receivable->amount_paid;

            return $pending * ($rate ?: 1.0);
        });

        $cuentasPorPagar = $payables->sum(function ($payable): float {
            $rate = $payable->currency?->is_base ? 1.0 : (float) $payable->currency?->currentRate();
            $pending = (float) $payable->amount_total - (float) $payable->amount_paid;

            return $pending * ($rate ?: 1.0);
        });

        $cuentasPorPagar = $cuentasPorPagar * -1;
        $totalGeneral = $balanceEnCuenta + $cuentasPorCobrar + $cuentasPorPagar;

        return Inertia::render('accounts/index', [
            'accounts' => AccountResource::collection($accounts),
            'accountingStats' => [
                'cuentasPorPagar' => $cuentasPorPagar,
                'cuentasPorCobrar' => $cuentasPorCobrar,
                'balanceEnCuenta' => $balanceEnCuenta,
                'totalGeneral' => $totalGeneral,
            ],
        ]);
    }

    /**
     * Show the form for creating a new account.
     */
    public function create(#[CurrentUser] User $user): Response
    {
        $currencies = $user->currencies()->get()->map(fn (Currency $currency): array => [
            'id' => $currency->id,
            'name' => $currency->name,
            'symbol' => $currency->symbol,
        ]);

        $accountTypes = collect(AccountType::cases())->map(fn (AccountType $type): array => [
            'value' => $type->value,
            'label' => $type->label(),
            'emoji' => $type->emoji(),
            'description' => $type->description(),
        ]);

        return Inertia::render('accounts/create', [
            'currencies' => $currencies,
            'accountTypes' => $accountTypes,
        ]);
    }

    /**
     * Store a newly created account in storage.
     */
    public function store(CreateAccountRequest $request, CreateAccountAction $action, #[CurrentUser] User $user): RedirectResponse
    {
        $data = $request->getDto();

        $action->handle($user, $data);

        return to_route('accounts')->with('success', 'Cuenta creada exitosamente.');
    }

    /**
     * Show the form for editing the specified account.
     */
    public function edit(Account $account): Response
    {
        $accountTypes = collect(AccountType::cases())->map(fn (AccountType $type): array => [
            'value' => $type->value,
            'label' => $type->label(),
            'emoji' => $type->emoji(),
            'description' => $type->description(),
        ]);

        return Inertia::render('accounts/edit', [
            'account' => AccountResource::make($account),
            'accountTypes' => $accountTypes,
        ]);
    }

    /**
     * Update the specified account in storage.
     */
    public function update(UpdateAccountRequest $request, Account $account, UpdateAccountAction $action): RedirectResponse
    {
        $data = $request->getDto();

        $action->handle($account, $data);

        return to_route('accounts.show', $account)->with('success', 'Cuenta actualizada exitosamente.');
    }

    /**
     * Display the specified account.
     */
    public function show(Request $request, Account $account, #[CurrentUser] User $user): Response
    {
        $page = $request->integer('page', 1);
        $per_page = $request->integer('per_page', 20);
        $dateFrom = $request->string('date_from')->toString();
        $dateTo = $request->string('date_to')->toString();

        $incomeCategories = $user->categories()
            ->where('type', CategoryType::INCOME)
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'emoji' => $category->emoji,
                'type' => $category->type,
            ]);

        $expenseCategories = $user->categories()
            ->where('type', CategoryType::EXPENSE)
            ->get()
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'emoji' => $category->emoji,
                'type' => $category->type,
            ]);

        $otherAccounts = $user->accounts()
            ->where('id', '!=', $account->id)
            ->with('currency')
            ->get()
            ->map(fn (Account $acc): array => [
                'id' => $acc->id,
                'uuid' => $acc->uuid,
                'name' => $acc->name,
                'emoji' => $acc->emoji,
                'currency' => [
                    'symbol' => $acc->currency?->symbol,
                    'name' => $acc->currency?->name,
                    'rate' => $acc->currency?->currentRate(),
                ],
            ]);

        $contacts = $user->contacts()
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone']);

        $transactionTypes = collect(TransactionType::cases())
            ->filter(fn (TransactionType $type): bool => $type->isCreatable())
            ->map(fn (TransactionType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ]);

        return Inertia::render('accounts/show', [
            'account' => fn () => AccountResource::make($account->fresh()),
            'transactions' => fn () => Inertia::deepMerge(
                $account->transactions()
                    ->with('category', 'splits.category', 'fromAccount.currency', 'destinationAccount.currency', 'receivables.contact')
                    ->when($dateFrom, fn ($query) => $query->whereDate('transaction_date', '>=', $dateFrom))
                    ->when($dateTo, fn ($query) => $query->whereDate('transaction_date', '<=', $dateTo))
                    ->orderBy('transaction_date', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->paginate($per_page, page: $page)
            ),
            'incomeCategories' => $incomeCategories,
            'expenseCategories' => $expenseCategories,
            'otherAccounts' => $otherAccounts,
            'contacts' => $contacts,
            'transactionTypes' => $transactionTypes,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
