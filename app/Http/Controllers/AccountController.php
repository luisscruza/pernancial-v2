<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateAccountAction;
use App\Enums\AccountType;
use App\Http\Requests\CreateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
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
    public function show(Request $request, Account $account): Response
    {
        $page = $request->integer('page', 1);
        $per_page = $request->integer('per_page', 20);

        return Inertia::render('accounts/show', [
            'account' => AccountResource::make($account),
            'transactions' => Inertia::deepMerge($account->transactions()
                ->with('category')
                ->orderBy('created_at', 'desc')
                ->paginate($per_page, page: $page)),
        ]);
    }
}
