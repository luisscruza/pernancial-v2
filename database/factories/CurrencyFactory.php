<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Currency>
 */
final class CurrencyFactory extends Factory
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
            'code' => fake()->currencyCode().'_'.fake()->unique()->randomNumber(5, true),
            'name' => fake()->unique()->name(),
            'symbol' => fake()->randomElement(['$', '€', '£', '¥']),
            'decimal_places' => fake()->numberBetween(0, 2),
            'decimal_separator' => fake()->randomElement(['.', ',']),
            'thousands_separator' => fake()->randomElement(['.', ',']),
            'symbol_position' => fake()->randomElement(['before', 'after']),
            'conversion_rate' => fake()->randomFloat(10, 0.1, 10),
            'is_base' => false,
        ];
    }
}
