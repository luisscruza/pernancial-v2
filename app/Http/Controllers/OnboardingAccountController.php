<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateOnboardingAccountAction;
use App\Enums\BaseCurrency;
use App\Http\Requests\StoreOnboardingAccountRequest;
use App\Models\User;
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
        /** @var User $user */
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
        /** @var User $user */
        $user = $request->user();

        $createOnboardingAccountAction->handle($user, $request->getDto());

        return redirect()->route('onboarding.setting-up');
    }
}
