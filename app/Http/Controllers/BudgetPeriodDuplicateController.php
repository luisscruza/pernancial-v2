<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\BudgetPeriod;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

final class BudgetPeriodDuplicateController
{
    public function __invoke(BudgetPeriod $budgetPeriod, #[CurrentUser] User $user): Response
    {

        $budgetPeriod->load(['budgets.category']);

        $categories = $user->categories()
            ->orderBy('name')
            ->get(['id', 'name', 'emoji', 'type']);

        $budgetData = [];

        foreach ($budgetPeriod->budgets as $budget) {
            $budgetData[$budget->category_id] = [
                'amount' => $budget->amount,
                'category_id' => $budget->category_id,
            ];
        }

        return Inertia::render('budgets/period-duplicate', [
            'originalPeriod' => $budgetPeriod,
            'categories' => $categories,
            'budgetData' => $budgetData,
        ]);
    }
}
