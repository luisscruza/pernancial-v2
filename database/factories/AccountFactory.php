<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AccountType;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
final class AccountFactory extends Factory
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
            'currency_id' => Currency::factory(),
            'name' => fake()->word(),
            'type' => fake()->randomElement(AccountType::cases()),
            'balance' => fake()->randomFloat(4, 0, 10000),
            'description' => fake()->sentence(),
            'emoji' => fake()->randomElement(['💰', '💵', '💸', '💳', '🏦', '💼', '📈']),
            'color' => fake()->hexColor(),
        ];
    }
}
