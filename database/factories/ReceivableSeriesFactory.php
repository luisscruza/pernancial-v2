<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Contact;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReceivableSeries>
 */
final class ReceivableSeriesFactory extends Factory
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
            'contact_id' => Contact::factory(),
            'currency_id' => Currency::factory(),
            'name' => fake()->word(),
            'default_amount' => fake()->randomFloat(2, 50, 2000),
            'is_recurring' => true,
            'recurrence_rule' => [
                'frequency' => 'monthly',
                'day_of_month' => 1,
            ],
            'next_due_date' => now()->addMonth()->startOfMonth()->toDateString(),
        ];
    }
}
