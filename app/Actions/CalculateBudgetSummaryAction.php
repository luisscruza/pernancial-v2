<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\BudgetSummaryDto;
use App\Enums\BudgetType;
use App\Models\Budget;
use App\Models\Transaction;
use App\Models\TransactionSplit;
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
        $directTransactions = Transaction::query()
            ->where('category_id', $budget->category_id)
            ->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->whereDoesntHave('splits')
            ->with(['account.currency'])
            ->get();

        $splitTransactions = TransactionSplit::query()
            ->where('category_id', $budget->category_id)
            ->whereHas('transaction', function ($query) use ($dateRange): void {
                $query->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']]);
            })
            ->with(['transaction.account.currency', 'transaction.account.user.currencies'])
            ->get();

        // Sum up the spending (convert to user's base currency if needed)
        $totalSpent = $directTransactions->sum(fn (Transaction $transaction): float => $this->convertTransactionAmountToBase(
            $transaction,
            $transaction->personal_amount ?? $transaction->amount,
        ));
        $totalSpent += $splitTransactions->sum(fn (TransactionSplit $split): float => $this->convertSplitToBaseCurrency($split));

        $transactionCount = $directTransactions->count() + $splitTransactions->count();

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
            transactionCount: $transactionCount
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

    private function convertSplitToBaseCurrency(TransactionSplit $split): float
    {
        $transaction = $split->transaction;

        if (! $transaction) {
            return 0.0;
        }

        return $this->convertTransactionAmountToBase($transaction, $split->amount);
    }

    private function convertTransactionAmountToBase(Transaction $transaction, float $amount): float
    {
        $accountCurrency = $transaction->account->currency;
        $userBaseCurrency = $transaction->account->user->currencies()
            ->where('is_base', true)
            ->first();

        if (! $userBaseCurrency || $accountCurrency->id === $userBaseCurrency->id) {
            return $amount;
        }

        if ($transaction->conversion_rate) {
            return $amount * $transaction->conversion_rate;
        }

        return $amount * $accountCurrency->conversion_rate;
    }
}
