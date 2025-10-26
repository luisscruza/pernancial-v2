<?php

declare(strict_types=1);

namespace App\Dto;

use App\Models\Budget;

final readonly class BudgetSummaryDto
{
    public function __construct(
        public Budget $budget,
        public float $totalSpent,
        public float $remaining,
        public float $percentageUsed,
        public bool $isOverBudget,
        public array $dateRange,
        public int $transactionCount,
    ) {}

    /**
     * @param  array{budget: Budget, total_spent: float, remaining: float, percentage_used: float, is_over_budget: bool, date_range: array{start: string, end: string}, transaction_count: int}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            budget: $data['budget'],
            totalSpent: $data['total_spent'],
            remaining: $data['remaining'],
            percentageUsed: $data['percentage_used'],
            isOverBudget: $data['is_over_budget'],
            dateRange: $data['date_range'],
            transactionCount: $data['transaction_count'],
        );
    }

    /**
     * @return array{budget: Budget, total_spent: float, remaining: float, percentage_used: float, is_over_budget: bool, date_range: array{start: string, end: string}, transaction_count: int}
     */
    public function toArray(): array
    {
        return [
            'budget' => $this->budget,
            'total_spent' => $this->totalSpent,
            'remaining' => $this->remaining,
            'percentage_used' => $this->percentageUsed,
            'is_over_budget' => $this->isOverBudget,
            'date_range' => $this->dateRange,
            'transaction_count' => $this->transactionCount,
        ];
    }
}
