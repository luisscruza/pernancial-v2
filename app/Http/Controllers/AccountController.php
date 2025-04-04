<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\AccountResource;
use App\Models\Account;
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
}
