<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CalculateBudgetSummaryAction;
use App\Actions\CreateBudgetAction;
use App\Actions\UpdateBudgetAction;
use App\Dto\CreateBudgetDto;
use App\Http\Requests\CreateBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $budgets = $request->user()->budgets()
            ->with(['category', 'budgetPeriod'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('budgets/index', [
            'budgets' => $budgets,
        ]);
    }

    public function create(): Response
    {
        $categories = Auth::user()->categories()
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('budgets/create', [
            'categories' => $categories,
        ]);
    }

    public function store(CreateBudgetRequest $request, CreateBudgetAction $action): RedirectResponse
    {
        $dto = CreateBudgetDto::fromArray([
            ...$request->validated(),
            'user_id' => Auth::id(),
        ]);

        $budget = $action->handle($dto);

        return redirect()->route('budgets.show', $budget)
            ->with('flash', [
                'type' => 'success',
                'message' => 'Presupuesto creado exitosamente.',
            ]);
    }

    public function show(Budget $budget, CalculateBudgetSummaryAction $calculateAction): Response
    {
        $budget->load(['category', 'budgetPeriod']);
        $summary = $calculateAction->handle($budget);

        $accountIds = Auth::user()
            ->accounts()
            ->pluck('id');

        $transactions = Transaction::query()
            ->with(['account.currency', 'category'])
            ->whereIn('account_id', $accountIds)
            ->where('category_id', $budget->category_id)
            ->whereBetween('transaction_date', [$budget->budgetPeriod->start_date, $budget->budgetPeriod->end_date])
            ->orderByDesc('transaction_date')
            ->get();

        return Inertia::render('budgets/show', [
            'budget' => $budget,
            'budgetSummary' => $summary->toArray(),
            'transactions' => $transactions,
        ]);
    }

    public function edit(Budget $budget): Response
    {
        $budget->load(['category', 'budgetPeriod']);

        $categories = Auth::user()->categories()
            ->orderBy('name')
            ->get(['id', 'name', 'emoji', 'type']);

        return Inertia::render('budgets/edit', [
            'budget' => $budget,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget, UpdateBudgetAction $action): RedirectResponse
    {
        $budget->load('budgetPeriod');
        $validated = $request->validated();

        $dto = CreateBudgetDto::fromArray([
            'user_id' => $budget->user_id,
            'name' => $validated['name'] ?? $budget->name,
            'amount' => $validated['amount'] ?? $budget->amount,
            'type' => $validated['type'] ?? $budget->type->value,
            'period_type' => $validated['period_type'] ?? $budget->budgetPeriod->type->value,
            'category_id' => $validated['category_id'] ?? $budget->category_id,
            'start_date' => $validated['start_date'] ?? $budget->start_date?->toDateString(),
            'end_date' => $validated['end_date'] ?? $budget->end_date?->toDateString(),
            'description' => $validated['description'] ?? $budget->description,
        ]);

        $action->handle($budget, $dto);

        return redirect()->route('budgets.show', $budget)
            ->with('flash', [
                'type' => 'success',
                'message' => 'Presupuesto actualizado exitosamente.',
            ]);
    }

    public function destroy(Budget $budget): RedirectResponse
    {
        $budget->delete();

        return redirect()->route('budgets.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Presupuesto eliminado exitosamente.',
            ]);
    }
}
