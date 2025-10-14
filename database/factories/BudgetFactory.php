<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BudgetPeriod;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Budget>
 */
final class BudgetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'budget_period_id' => BudgetPeriod::factory(),
            'type' => 'period',
            'name' => fake()->optional()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ];
    }

    /**
     * Make a one-time budget with specific dates.
     */
    public function oneTime(): static
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+2 months');

        return $this->state([
            'type' => 'one_time',
            'budget_period_id' => null,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }
}
