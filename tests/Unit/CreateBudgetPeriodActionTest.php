<?php

declare(strict_types=1);

use App\Actions\CreateBudgetPeriodAction;
use App\Enums\BudgetPeriodType;
use App\Enums\BudgetType;
use App\Models\Category;
use App\Models\User;

it('creates a budget period with budgets for each category', function () {
    $user = User::factory()->create();
    $foodCategory = Category::factory()->for($user)->create();
    $rentCategory = Category::factory()->for($user)->create();

    $action = app(CreateBudgetPeriodAction::class);

    $period = $action->handle([
        'user_id' => $user->id,
        'name' => 'March 2025',
        'type' => BudgetPeriodType::MONTHLY->value,
        'start_date' => '2025-03-01',
        'end_date' => '2025-03-31',
        'budgets' => [
            [
                'category_id' => $foodCategory->id,
                'amount' => 250.00,
                'name' => 'Food budget',
            ],
            [
                'category_id' => $rentCategory->id,
                'amount' => 800.00,
                'description' => 'Rent for March',
            ],
        ],
    ]);

    expect($period->budgets)->toHaveCount(2)
        ->and($period->type)->toBe(BudgetPeriodType::MONTHLY);

    $foodBudget = $period->budgets->firstWhere('category_id', $foodCategory->id);
    $rentBudget = $period->budgets->firstWhere('category_id', $rentCategory->id);

    expect($foodBudget)->not->toBeNull()
        ->and($foodBudget->type)->toBe(BudgetType::PERIOD)
        ->and($foodBudget->name)->toBe('Food budget')
        ->and((float) $foodBudget->amount)->toBe(250.0);

    expect($rentBudget)->not->toBeNull()
        ->and($rentBudget->type)->toBe(BudgetType::PERIOD)
        ->and($rentBudget->name)->toBe('March 2025 - Categoría')
        ->and($rentBudget->description)->toBe('Rent for March')
        ->and((float) $rentBudget->amount)->toBe(800.0);
});
