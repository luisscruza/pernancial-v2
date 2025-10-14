<?php

declare(strict_types=1);

namespace App\Actions;

use App\Dto\CreateBudgetDto;
use App\Models\Budget;
use Illuminate\Support\Facades\DB;

final class UpdateBudgetAction
{
    /**
     * Update a budget with the provided data.
     */
    public function handle(Budget $budget, CreateBudgetDto $dto): Budget
    {
        return DB::transaction(function () use ($budget, $dto) {
            $budget->update([
                'name' => $dto->name,
                'amount' => $dto->amount,
                'type' => $dto->type,
                'category_id' => $dto->categoryId,
                'description' => $dto->description,
            ]);

            return $budget->fresh();
        });
    }
}
