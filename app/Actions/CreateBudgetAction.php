<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateBudgetDto;
use App\Models\Budget;
use App\Models\BudgetPeriod;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

final class CreateBudgetAction
{
    /**
     * Create a budget with its associated budget period if needed.
     */
    public function handle(CreateBudgetDto $dto): Budget
    {
        return DB::transaction(function () use ($dto) {
            $budgetPeriod = $this->createOrGetBudgetPeriod($dto);

            return Budget::create([
                'user_id' => $dto->userId,
                'budget_period_id' => $budgetPeriod->id,
                'category_id' => $dto->categoryId,
                'name' => $dto->name,
                'amount' => $dto->amount,
                'type' => $dto->type,
                'start_date' => $dto->startDate,
                'end_date' => $dto->endDate,
            ]);
        });
    }

    /**
     * Create or find existing budget period.
     */
    private function createOrGetBudgetPeriod(CreateBudgetDto $dto): BudgetPeriod
    {
        $startDate = Carbon::parse($dto->startDate);
        $endDate = Carbon::parse($dto->endDate);

        // Try to find existing budget period for the same date range
        $existingPeriod = BudgetPeriod::where('user_id', $dto->userId)
            ->where('type', $dto->periodType)
            ->where('start_date', $startDate->toDateString())
            ->where('end_date', $endDate->toDateString())
            ->first();

        if ($existingPeriod) {
            return $existingPeriod;
        }

        // Create new budget period
        return BudgetPeriod::create([
            'user_id' => $dto->userId,
            'name' => $this->generatePeriodName($dto),
            'type' => $dto->periodType,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
        ]);
    }

    /**
     * Generate a descriptive name for the budget period.
     */
    private function generatePeriodName(CreateBudgetDto $dto): string
    {
        $startDate = Carbon::parse($dto->startDate);

        return match ($dto->periodType->value) {
            'monthly' => $startDate->format('F Y'),
            'weekly' => 'Semana del '.$startDate->format('j \d\e F Y'),
            'yearly' => $startDate->format('Y'),
            'custom' => $startDate->format('j \d\e F').' - '.Carbon::parse($dto->endDate)->format('j \d\e F Y'),
            default => $startDate->format('F Y')
        };
    }
}
