<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BudgetPeriod>
 */
final class BudgetPeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+2 months');

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true).' Budget Period',
            'type' => fake()->randomElement(['monthly', 'weekly', 'yearly', 'custom']),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'is_active' => true,
        ];
    }
}
