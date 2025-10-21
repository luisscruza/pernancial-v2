<?php

declare(strict_types=1);

namespace App\Dto;

use App\Enums\BudgetPeriodType;
use App\Enums\BudgetType;

final class CreateBudgetDto
{
    public function __construct(
        public readonly int $userId,
        public readonly int $categoryId,
        public readonly BudgetType $type,
        public readonly BudgetPeriodType $periodType,
        public readonly string $name,
        public readonly float $amount,
        public readonly ?string $startDate,
        public readonly ?string $endDate,
        public readonly ?string $description = null,
    ) {}

    /**
     * @param  array{user_id: int, category_id: int, type: string, period_type: string, name: string, amount: float, start_date: string, end_date: string, description: string|null}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            userId: $data['user_id'],
            categoryId: $data['category_id'],
            type: BudgetType::from($data['type']),
            periodType: BudgetPeriodType::from($data['period_type']),
            name: $data['name'],
            amount: $data['amount'],
            startDate: $data['start_date'],
            endDate: $data['end_date'],
            description: $data['description'] ?? null,
        );
    }

    /**
     * @return array{user_id: int, category_id: int, type: string, period_type: string, name: string, amount: float, start_date: string, end_date: string, description: string|null}
     */
    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'category_id' => $this->categoryId,
            'type' => $this->type->value,
            'period_type' => $this->periodType->value,
            'name' => $this->name,
            'amount' => $this->amount,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'description' => $this->description,
        ];
    }
}
