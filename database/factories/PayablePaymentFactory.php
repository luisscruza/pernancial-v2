<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Account;
use App\Models\Payable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PayablePayment>
 */
final class PayablePaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payable_id' => Payable::factory(),
            'account_id' => Account::factory(),
            'transaction_id' => null,
            'amount' => fake()->randomFloat(2, 10, 2000),
            'paid_at' => now()->toDateString(),
            'note' => fake()->sentence(),
        ];
    }
}
