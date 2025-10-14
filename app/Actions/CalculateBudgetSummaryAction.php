<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\BudgetSummaryDto;
use App\Enums\BudgetType;
use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;

final class CalculateBudgetSummaryAction
{
    /**
     * Calculate budget summary including spent amount and remaining budget.
     */
    public function handle(Budget $budget): BudgetSummaryDto
    {
        // Get the date range for this budget
        $dateRange = $this->getDateRangeForBudget($budget);

        // Find all expense transactions in this category within the date range
        $transactions = Transaction::where('category_id', $budget->category_id)
            ->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->with(['account.currency'])
            ->get();

        // Sum up the spending (convert to user's base currency if needed)
        $totalSpent = $transactions->sum(function ($transaction) {
            return $this->convertToBaseCurrency($transaction);
        });

        $remaining = $budget->amount - $totalSpent;
        $percentageUsed = $budget->amount > 0 ? ($totalSpent / $budget->amount) * 100 : 0;

        return new BudgetSummaryDto(
            budget: $budget,
            totalSpent: $totalSpent,
            remaining: $remaining,
            percentageUsed: $percentageUsed,
            isOverBudget: $remaining < 0,
            dateRange: [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
            ],
            transactionCount: $transactions->count()
        );
    }

    /**
     * Get the date range for a budget.
     *
     * @return array{start: Carbon, end: Carbon}
     */
    private function getDateRangeForBudget(Budget $budget): array
    {
        if ($budget->type === BudgetType::ONE_TIME) {
            return [
                'start' => Carbon::parse($budget->start_date),
                'end' => Carbon::parse($budget->end_date),
            ];
        }

        // For period budgets, use the budget period's dates
        return [
            'start' => Carbon::parse($budget->budgetPeriod->start_date),
            'end' => Carbon::parse($budget->budgetPeriod->end_date),
        ];
    }

    /**
     * Convert transaction amount to user's base currency.
     */
    private function convertToBaseCurrency(Transaction $transaction): float
    {
        $accountCurrency = $transaction->account->currency;
        $userBaseCurrency = $transaction->account->user->currencies()
            ->where('is_base', true)
            ->first();

        if (! $userBaseCurrency || $accountCurrency->id === $userBaseCurrency->id) {
            return $transaction->amount;
        }

        // Convert using current conversion rate
        return $transaction->amount * $accountCurrency->conversion_rate;
    }
}
