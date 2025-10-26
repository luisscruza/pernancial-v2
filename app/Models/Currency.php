<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToUser;
use Database\Factories\CurrencyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Date;

final class Currency extends Model
{
    /** @use BelongsToUser<Currency> */
    use BelongsToUser;

    /** @use HasFactory<CurrencyFactory> */
    use HasFactory;

    /**
     * Get the accounts for the currency.
     *
     * @return HasMany<Account, $this>
     */
    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    /**
     * Get the rates for the currency.
     *
     * @return HasMany<CurrencyRate, $this>
     */
    public function rates(): HasMany
    {
        return $this->hasMany(CurrencyRate::class);
    }

    /**
     * Get the rate for a specific date.
     */
    public function rateForDate(string $date): float
    {
        $rate = $this->rates()
            ->where('effective_date', '<=', $date)
            ->orderBy('effective_date', 'desc')
            ->first();

        return (float) $rate?->rate ?? 1;
    }

    /**
     * Get the current rate.
     */
    public function currentRate(): float
    {
        return $this->rateForDate(Date::now()->toDateString());
    }

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'conversion_rate' => 'decimal:10',
            'is_base' => 'boolean',
        ];
    }
}
