<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CacheBudgetPeriodSummaryAction;
use App\Actions\CalculateBudgetSummaryAction;
use App\Actions\CreateBudgetPeriodAction;
use App\Dto\BudgetSummaryDto;
use App\Enums\BudgetType;
use App\Http\Requests\CreateBudgetPeriodRequest;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class BudgetPeriodController extends Controller
{
    public function index(Request $request, CacheBudgetPeriodSummaryAction $cacheAction): Response
    {
        $user = $request->user();

        // Get all budget periods with their budgets
        $budgetPeriods = $user->budgetPeriods()
            ->with(['budgets.category'])
            ->orderBy('start_date', 'desc')
            ->get();

        // Calculate spending for each period using cache
        $budgetPeriods = $budgetPeriods->map(function ($period) use ($cacheAction) {
            $summary = $cacheAction->handle($period);

            // Add spending data to the period
            $period->total_expense_spent = $summary['total_expense_spent'];
            $period->total_income_received = $summary['total_income_received'];
            $period->total_spent = $summary['total_spent'];

            return $period;
        });

        // Get current period (if any)
        $currentPeriod = $budgetPeriods->first(fn ($period) => $period->isCurrent());

        return Inertia::render('budgets/index', [
            'budgetPeriods' => $budgetPeriods,
            'currentPeriod' => $currentPeriod,
        ]);
    }

    public function show(BudgetPeriod $budgetPeriod, CalculateBudgetSummaryAction $calculateAction, #[CurrentUser] User $user): Response
    {
        $budgetPeriod->load(['budgets.category']);

        $budgetSummaries = $budgetPeriod->budgets->map(fn ($budget): BudgetSummaryDto => $calculateAction->handle($budget));

        $categories = $user->categories()
            ->orderBy('name')
            ->get(['id', 'name', 'emoji', 'type']);

        return Inertia::render('budgets/period-show', [
            'budgetPeriod' => $budgetPeriod,
            'budgetSummaries' => $budgetSummaries->map->toArray(),
            'categories' => $categories,
        ]);
    }

    public function create(#[CurrentUser] User $user): Response
    {
        $categories = $user->categories()
            ->orderBy('name')
            ->get(['id', 'name', 'emoji', 'type']);

        return Inertia::render('budgets/period-create', [
            'categories' => $categories,
        ]);
    }

    public function store(CreateBudgetPeriodRequest $request, CreateBudgetPeriodAction $action, #[CurrentUser] User $user): RedirectResponse
    {
        $data = [
            ...$request->validated(),
            'user_id' => $user->id,
        ];

        $budgetPeriod = $action->handle($data);

        return redirect()->route('budget-periods.show', $budgetPeriod)
            ->with('flash', [
                'type' => 'success',
                'message' => 'Período de presupuesto creado exitosamente.',
            ]);
    }

    public function edit(BudgetPeriod $budgetPeriod, #[CurrentUser] User $user): Response
    {
        $budgetPeriod->load(['budgets.category']);

        $categories = $user->categories()
            ->orderBy('name')
            ->get(['id', 'name', 'emoji', 'type']);

        return Inertia::render('budgets/period-edit', [
            'budgetPeriod' => $budgetPeriod,
            'categories' => $categories,
        ]);
    }

    public function update(BudgetPeriod $budgetPeriod, Request $request, #[CurrentUser] User $user): RedirectResponse
    {
        // @TODO: Refactor to Form Request and Actions, AI crap...
        $request->validate([
            'name' => 'required|string|max:255',
            'budgets' => 'required|array',
            'budgets.*.amount' => 'required|numeric|min:0',
            'budgets.*.category_id' => 'required|exists:categories,id',
            'budgets.*.budget_id' => 'nullable|exists:budgets,id',
        ]);

        $budgetPeriod->update([
            'name' => $request->input('name'),
        ]);

        $budgets = $request->input('budgets', []);

        foreach ($budgets as $budget) {
            Budget::updateOrCreate([
                'category_id' => $budget['category_id'],
                'user_id' => $user->id,
                'budget_period_id' => $budgetPeriod->id,
                'type' => BudgetType::PERIOD,
            ], [
                'amount' => $budget['amount'],
            ]);
        }

        return back()->with([
            'message' => 'Período de presupuesto actualizado exitosamente.',
        ]);
    }
}
