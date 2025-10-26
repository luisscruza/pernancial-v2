<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Budget;
use Illuminate\Support\Facades\DB;

final readonly class DeleteBudgetAction
{
    /**
     * Execute the action.
     */
    public function handle(Budget $budget): void
    {
        DB::transaction(function () use ($budget): void {
            $budget->delete();
        });
    }
}
