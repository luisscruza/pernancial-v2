<?php

declare(strict_types=1);

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\BudgetPeriodController;
use App\Http\Controllers\BudgetPeriodDuplicateController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\CurrencyRateController;
use App\Http\Controllers\FinanceChatController;
use App\Http\Controllers\FinanceChatDestroyController;
use App\Http\Controllers\FinanceChatRenameController;
use App\Http\Controllers\FinanceChatResetController;
use App\Http\Controllers\FinanceChatStreamController;
use App\Http\Controllers\OnboardingAccountController;
use App\Http\Controllers\OnboardingCategoryController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PayableController;
use App\Http\Controllers\PayablePaymentController;
use App\Http\Controllers\ReceivableController;
use App\Http\Controllers\ReceivablePaymentController;
use App\Http\Controllers\TelegramWebhookController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'onboarding'])->group(function () {
    Route::get('/token', function (): string {
        return request()->user()->createToken('api-token')->plainTextToken;
    })->name('token');
    Route::get('/', [AccountController::class, 'index'])->name('accounts');
    Route::get('/accounts/create', [AccountController::class, 'create'])->name('accounts.create');
    Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::get('/accounts/{account}', [AccountController::class, 'show'])->name('accounts.show');
    Route::get('/accounts/{account}/edit', [AccountController::class, 'edit'])->name('accounts.edit');
    Route::put('/accounts/{account}', [AccountController::class, 'update'])->name('accounts.update');
    Route::post('/accounts/{account}/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('/accounts/{account}/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('/accounts/{account}/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    Route::get('/finance/chat', [FinanceChatController::class, 'index'])->name('finance.chat');
    Route::post('/finance/chat/stream', FinanceChatStreamController::class)->name('finance.chat.stream');
    Route::post('/finance/chat/reset', FinanceChatResetController::class)->name('finance.chat.reset');
    Route::patch('/finance/chat/{conversation}', FinanceChatRenameController::class)->name('finance.chat.rename');
    Route::delete('/finance/chat/{conversation}', FinanceChatDestroyController::class)->name('finance.chat.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');

    Route::get('/currencies', [CurrencyController::class, 'index'])->name('currencies.index');
    Route::get('/currencies/create', [CurrencyController::class, 'create'])->name('currencies.create');
    Route::post('/currencies', [CurrencyController::class, 'store'])->name('currencies.store');
    Route::get('/currencies/{currency}', [CurrencyController::class, 'show'])->name('currencies.show');
    Route::get('/currencies/{currency}/edit', [CurrencyController::class, 'edit'])->name('currencies.edit');
    Route::put('/currencies/{currency}', [CurrencyController::class, 'update'])->name('currencies.update');
    Route::post('/currencies/{currency}/rates', [CurrencyRateController::class, 'store'])->name('currencies.rates.store');

    Route::get('/contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/create', [ContactController::class, 'create'])->name('contacts.create');
    Route::post('/contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::get('/contacts/{contact}', [ContactController::class, 'show'])->name('contacts.show');
    Route::get('/contacts/{contact}/edit', [ContactController::class, 'edit'])->name('contacts.edit');
    Route::put('/contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');

    Route::get('/receivables', [ReceivableController::class, 'index'])->name('receivables.index');
    Route::get('/receivables/create', [ReceivableController::class, 'create'])->name('receivables.create');
    Route::post('/receivables', [ReceivableController::class, 'store'])->name('receivables.store');
    Route::get('/receivables/{receivable}', [ReceivableController::class, 'show'])->name('receivables.show');
    Route::get('/receivables/{receivable}/edit', [ReceivableController::class, 'edit'])->name('receivables.edit');
    Route::put('/receivables/{receivable}', [ReceivableController::class, 'update'])->name('receivables.update');
    Route::post('/receivables/{receivable}/payments', [ReceivablePaymentController::class, 'store'])->name('receivables.payments.store');

    Route::get('/payables', [PayableController::class, 'index'])->name('payables.index');
    Route::get('/payables/create', [PayableController::class, 'create'])->name('payables.create');
    Route::post('/payables', [PayableController::class, 'store'])->name('payables.store');
    Route::get('/payables/{payable}', [PayableController::class, 'show'])->name('payables.show');
    Route::get('/payables/{payable}/edit', [PayableController::class, 'edit'])->name('payables.edit');
    Route::put('/payables/{payable}', [PayableController::class, 'update'])->name('payables.update');
    Route::post('/payables/{payable}/payments', [PayablePaymentController::class, 'store'])->name('payables.payments.store');

    // Budget Periods (main interface)
    Route::get('/budgets', [BudgetPeriodController::class, 'index'])->name('budgets.index');
    Route::get('/budget-periods/create', [BudgetPeriodController::class, 'create'])->name('budget-periods.create');
    Route::post('/budget-periods', [BudgetPeriodController::class, 'store'])->name('budget-periods.store');
    Route::get('/budget-periods/{budgetPeriod}', [BudgetPeriodController::class, 'show'])->name('budget-periods.show');
    Route::get('/budget-periods/{budgetPeriod}/edit', [BudgetPeriodController::class, 'edit'])->name('budget-periods.edit');
    Route::get('/budget-periods/{budgetPeriod}/duplicate', BudgetPeriodDuplicateController::class)->name('budget-periods.duplicate');
    Route::put('/budget-periods/{budgetPeriod}', [BudgetPeriodController::class, 'update'])->name('budget-periods.update');

    // Individual Budgets (for editing within periods) - create must come before {budget} to avoid conflicts
    Route::get('/budgets/create', [BudgetController::class, 'create'])->name('budgets.create');
    Route::post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
    Route::get('/budgets/{budget}/edit', [BudgetController::class, 'edit'])->name('budgets.edit');
    Route::get('/budgets/{budget}', [BudgetController::class, 'show'])->name('budgets.show');
    Route::put('/budgets/{budget}', [BudgetController::class, 'update'])->name('budgets.update');
    Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy'])->name('budgets.destroy');
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

Route::post('/telegram/webhook', TelegramWebhookController::class)
    ->name('telegram.webhook');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
