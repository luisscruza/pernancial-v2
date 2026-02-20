<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionSplit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionSplit>
 */
final class TransactionSplitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'transaction_id' => Transaction::factory(),
            'category_id' => Category::factory(),
            'amount' => $this->faker->randomFloat(2, 1, 250),
        ];
    }
}
