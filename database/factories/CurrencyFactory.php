<?php

declare(strict_types=1);

namespace Database\Factories;

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
            'code' => fake()->unique()->currencyCode(),
            'name' => fake()->unique()->name(),
            'symbol' => fake()->randomElement(['$', '€', '£', '¥']),
            'conversion_rate' => fake()->randomFloat(10, 0.1, 10),
            'is_base' => false,
        ];
    }

    public function base(): self
    {
        return $this->state(fn (array $attributes): array => [
            'is_base' => true,
            'conversion_rate' => 1,
        ]);
    }
}
