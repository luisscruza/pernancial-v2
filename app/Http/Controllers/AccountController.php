<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateAccountAction;
use App\Enums\AccountType;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Http\Requests\CreateAccountRequest;
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
    public function index(): Response
    {
        $accounts = Account::query()
            ->with('currency')
            ->get();

        return Inertia::render('accounts/index', [
            'accounts' => AccountResource::collection($accounts),
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
     * Display the specified account.
     */
    public function show(Request $request, Account $account, #[CurrentUser] User $user): Response
    {
        $page = $request->integer('page', 1);
        $per_page = $request->integer('per_page', 20);

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
                ],
            ]);

        $transactionTypes = collect(TransactionType::cases())
            ->filter(fn (TransactionType $type): bool => ! in_array($type, [TransactionType::TRANSFER_IN, TransactionType::TRANSFER_OUT, TransactionType::INITIAL], true))
            ->map(fn (TransactionType $type): array => [
                'value' => $type->value,
                'label' => $type->label(),
            ]);

        return Inertia::render('accounts/show', [
            'account' => AccountResource::make($account),
            'transactions' => Inertia::deepMerge($account->transactions()
                ->with('category', 'fromAccount.currency', 'destinationAccount.currency')
                ->orderBy('transaction_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate($per_page, page: $page)),
            'incomeCategories' => $incomeCategories,
            'expenseCategories' => $expenseCategories,
            'otherAccounts' => $otherAccounts,
            'transactionTypes' => $transactionTypes,
        ]);
    }
}
