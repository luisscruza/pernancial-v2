<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class OnboardingController
{
    public function __invoke(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->categories()->count() > 0) {
            return redirect()->route('onboarding.accounts');
        }

        return redirect()->route('onboarding.categories');
    }
}
