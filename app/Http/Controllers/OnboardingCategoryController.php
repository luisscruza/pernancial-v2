<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateOnboardingCategoriesAction;
use App\Http\Requests\StoreOnboardingCategoriesRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class OnboardingCategoryController
{
    /**
     * Display the onboarding categories page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($user->categories()->count() > 0) {
            return redirect()->route('onboarding.accounts');
        }

        return Inertia::render('onboarding/categories/index');
    }

    public function store(StoreOnboardingCategoriesRequest $request, CreateOnboardingCategoriesAction $createOnboardingCategoriesAction): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var array<int, array{name: string, emoji: string}> $data */
        $data = $request->validated('categories');

        $createOnboardingCategoriesAction->handle($user, $data);

        return to_route('onboarding.accounts');
    }
}
