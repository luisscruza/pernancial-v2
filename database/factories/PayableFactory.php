<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Contact;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payable>
 */
final class PayableFactory extends Factory
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
            'payable_series_id' => null,
            'amount_total' => fake()->randomFloat(2, 20, 5000),
            'amount_paid' => 0,
            'status' => 'open',
            'description' => fake()->sentence(),
            'due_date' => now()->addDays(7)->toDateString(),
            'origin_transaction_id' => null,
        ];
    }
}
