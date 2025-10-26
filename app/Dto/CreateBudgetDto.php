<?php

declare(strict_types=1);

namespace App\Dto;

use App\Enums\BudgetPeriodType;
use App\Enums\BudgetType;

final readonly class CreateBudgetDto
{
    public function __construct(
        public int $userId,
        public int $categoryId,
        public BudgetType $type,
        public BudgetPeriodType $periodType,
        public ?string $name,
        public ?float $amount,
        public ?string $startDate,
        public ?string $endDate,
        public ?string $description = null,
    ) {}

    /**
     * @param  array{user_id: int, category_id: int, type: string, period_type: string, name: string|null, amount: float|string|null, start_date: string, end_date: string, description: string|null}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            userId: $data['user_id'],
            categoryId: $data['category_id'],
            type: BudgetType::from($data['type']),
            periodType: BudgetPeriodType::from($data['period_type']),
            name: $data['name'] ?? null,
            amount: isset($data['amount']) ? (float) $data['amount'] : null,
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
