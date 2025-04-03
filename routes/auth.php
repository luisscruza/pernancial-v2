<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\GoogleOAuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('auth/google', [GoogleOAuthController::class, 'store'])
        ->name('auth.google');

    Route::get('auth/google/callback', [GoogleOAuthController::class, 'index'])
        ->name('auth.google.callback');

    Route::get('auth', function () {
        return inertia('auth/login');
    })->name('auth');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
