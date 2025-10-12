<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
final class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['expense', 'income', 'transfer'];
        $type = $this->faker->randomElement($types);
        $amount = $this->faker->randomFloat(2, 10, 1000);

        $baseData = [
            'type' => $type,
            'amount' => $amount,
            'transaction_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'description' => $this->faker->sentence(),
            'account_id' => Account::factory(),
            'running_balance' => $amount, // This will be recalculated when transactions are created
        ];

        // Add type-specific data
        if ($type === 'transfer') {
            $baseData['destination_account_id'] = Account::factory();
            // Sometimes add currency conversion data
            if ($this->faker->boolean(30)) {
                $conversionRate = $this->faker->randomFloat(6, 0.5, 2.0);
                $baseData['conversion_rate'] = $conversionRate;
                $baseData['converted_amount'] = $amount * $conversionRate;
            }
        } else {
            // For expense and income, add category
            $baseData['category_id'] = Category::factory();
        }

        return $baseData;
    }

    /**
     * Configure the factory to create an expense transaction.
     */
    public function expense(): self
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'expense',
            'destination_account_id' => null,
            'conversion_rate' => null,
            'converted_amount' => null,
        ]);
    }

    /**
     * Configure the factory to create an income transaction.
     */
    public function income(): self
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'income',
            'destination_account_id' => null,
            'conversion_rate' => null,
            'converted_amount' => null,
        ]);
    }

    /**
     * Configure the factory to create a transfer transaction.
     */
    public function transfer(): self
    {
        return $this->state(function (array $attributes): array {
            $amount = $attributes['amount'] ?? $this->faker->randomFloat(2, 10, 1000);

            return [
                'type' => 'transfer',
                'destination_account_id' => Account::factory(),
                'category_id' => null,
                'destination_running_balance' => $amount,
            ];
        });
    }

    /**
     * Configure the factory to create a transfer with currency conversion.
     */
    public function transferWithConversion(): self
    {
        return $this->transfer()->state(function (array $attributes): array {
            $amount = $attributes['amount'] ?? $this->faker->randomFloat(2, 10, 1000);
            $conversionRate = $this->faker->randomFloat(6, 0.5, 2.0);

            return [
                'conversion_rate' => $conversionRate,
                'converted_amount' => $amount * $conversionRate,
            ];
        });
    }
}
