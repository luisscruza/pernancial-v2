<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\AccountResource;
use App\Models\Account;
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
