<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

final class GoogleOAuthController
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function store(): SymfonyRedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the Google authentication callback.
     */
    public function index(Request $request): RedirectResponse
    {
        /** @var \Laravel\Socialite\AbstractUser $googleUser */
        $googleUser = Socialite::driver('google')->user();

        $user = User::firstOrCreate([
            'email' => $googleUser->email,
        ], [
            'name' => $googleUser->name,
            'google_id' => $googleUser->id,
            'password' => Hash::make(Str::random(32)),
            'email_verified_at' => now(),
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
