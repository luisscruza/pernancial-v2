<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\CacheBudgetPeriodSummaryAction;
use App\Actions\CalculateBudgetSummaryAction;
use App\Actions\CreateBudgetPeriodAction;
use App\Dto\BudgetSummaryDto;
use App\Http\Requests\CreateBudgetPeriodRequest;
use App\Models\BudgetPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

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

        foreach ($request->input('budgets', []) as $budgetData) {
            if (isset($budgetData['budget_id'])) {
                $budget = $budgetPeriod->budgets()->find($budgetData['budget_id']);
                if ($budget) {
                    $budget->update([
                        'amount' => $budgetData['amount'],
                    ]);
                }
            } else {
                $budgetPeriod->budgets()->create([
                    'user_id' => $user->id,
                    'category_id' => $budgetData['category_id'],
                    'amount' => $budgetData['amount'],
                    'type' => \App\Enums\BudgetType::PERIOD,
                    'start_date' => $budgetPeriod->start_date,
                    'end_date' => $budgetPeriod->end_date,
                    'name' => $user->categories()->find($budgetData['category_id'])->name.' - '.$budgetPeriod->name,
                ]);
            }
        }

        $updatedBudgetIds = collect($request->input('budgets', []))
            ->pluck('budget_id')
            ->filter();

        $budgetPeriod->budgets()
            ->whereNotIn('id', $updatedBudgetIds)
            ->delete();

        return back()->with([
            'message' => 'Período de presupuesto actualizado exitosamente.',
        ]);
    }
}
