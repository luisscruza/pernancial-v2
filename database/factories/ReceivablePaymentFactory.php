<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Account;
use App\Models\Receivable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReceivablePayment>
 */
final class ReceivablePaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'receivable_id' => Receivable::factory(),
            'account_id' => Account::factory(),
            'transaction_id' => null,
            'amount' => fake()->randomFloat(2, 10, 2000),
            'paid_at' => now()->toDateString(),
            'note' => fake()->sentence(),
        ];
    }
}
