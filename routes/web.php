<?php

declare(strict_types=1);

use App\Http\Controllers\AccountController;
use App\Http\Controllers\OnboardingAccountController;
use App\Http\Controllers\OnboardingCategoryController;
use App\Http\Controllers\OnboardingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'onboarding'])->group(function () {
    Route::get('/', [AccountController::class, 'index'])->name('accounts');
    Route::get('/accounts/{account}', [AccountController::class, 'show'])->name('accounts.show');
});

Route::middleware(['auth', 'verified'])->prefix('onboarding')->group(function () {
    Route::get('/', OnboardingController::class)->name('onboarding');

    Route::get('/categories', [OnboardingCategoryController::class, 'index'])->name('onboarding.categories');
    Route::post('/categories', [OnboardingCategoryController::class, 'store'])->name('onboarding.categories.store');

    Route::get('/accounts', [OnboardingAccountController::class, 'index'])->name('onboarding.accounts');
    Route::post('/accounts', [OnboardingAccountController::class, 'store'])->name('onboarding.accounts.store');

    Route::get('/setting-up', function () {
        return Inertia::render('onboarding/setting-up');
    })->name('onboarding.setting-up');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
