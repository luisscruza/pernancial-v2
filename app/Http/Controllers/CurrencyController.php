<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CreateCurrencyAction;
use App\Actions\UpdateCurrencyAction;
use App\Dto\CreateCurrencyDto;
use App\Http\Requests\CreateCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\Currency;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Inertia\Inertia;
use Inertia\Response;

final class CurrencyController extends Controller
{
    public function index(Request $request): Response
    {
        $currencies = $request->user()->currencies()
            ->with(['rates' => function ($query): void {
                $query->latest('effective_date')->limit(1);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('currencies/index', [
            'currencies' => $currencies,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('currencies/create');
    }

    public function store(CreateCurrencyRequest $request, CreateCurrencyAction $action, #[CurrentUser] User $user): RedirectResponse
    {
        $dto = CreateCurrencyDto::fromArray($request->validated());

        $action->handle($dto, $user->id);

        return redirect()->route('currencies.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Moneda creada exitosamente.',
            ]);
    }

    public function show(Currency $currency): Response
    {
        $currency->load(['rates' => function ($query): void {
            $query->orderBy('effective_date', 'desc');
        }]);

        return Inertia::render('currencies/show', [
            'currency' => $currency,
        ]);
    }

    public function edit(Currency $currency): Response
    {
        return Inertia::render('currencies/edit', [
            'currency' => $currency,
        ]);
    }

    public function update(UpdateCurrencyRequest $request, Currency $currency, UpdateCurrencyAction $action): RedirectResponse
    {
        $dto = CreateCurrencyDto::fromArray($request->validated());

        $action->handle($currency, $dto);

        return redirect()->route('currencies.show', $currency)
            ->with('flash', [
                'type' => 'success',
                'message' => 'Moneda actualizada exitosamente.',
            ]);
    }
}
