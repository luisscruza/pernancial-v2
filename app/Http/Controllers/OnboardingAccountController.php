<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateOnboardingAccountAction;
use App\Enums\BaseCurrency;
use App\Http\Requests\StoreOnboardingAccountRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class OnboardingAccountController
{
    /**
     * Display the onboarding account page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($user->categories()->count() === 0) {
            return redirect()->route('onboarding.categories');
        }

        if ($user->accounts()->count() > 0) {
            return redirect()->route('accounts');
        }

        $currencies = BaseCurrency::toArray();

        return Inertia::render('onboarding/accounts/index', [
            'currencies' => $currencies,
        ]);
    }

    public function store(StoreOnboardingAccountRequest $request, CreateOnboardingAccountAction $createOnboardingAccountAction): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var array{name: string, description: string, balance: float, currency_id: string, type: string} $data */
        $data = $request->validated();

        $createOnboardingAccountAction->handle($user, $data);

        return redirect()->route('accounts');
    }
}
