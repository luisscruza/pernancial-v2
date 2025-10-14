<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AccountType;
use App\Traits\BelongsToUser;
use App\Traits\HasUuidRouting;
use Database\Factories\AccountFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read AccountType $type
 * @property-read int $id
 * @property int $user_id
 */
final class Account extends Model
{
    /**
     * @use BelongsToUser<Account>
     */
    use BelongsToUser;

    /** @use HasFactory<AccountFactory> */
    use HasFactory;

    /** @use HasUuidRouting<Account> */
    use HasUuidRouting;

    #[Scope]
    public static function active($query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @return BelongsTo<Currency, $this>
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Balance in the base currency.
     *
     * @return Attribute<float, never>
     */
    public function balanceInBase(): Attribute
    {
        return Attribute::make(
            get: fn (): float => (float) ($this->currency?->is_base ? $this->balance : $this->balance * $this->currency?->rateForDate(now()->format('Y-m-d')) ?? 1)
        );
    }

    /**
     * Balance in the base currency.
     *
     * @return Attribute<string, never>
     */
    public function accountingType(): Attribute
    {
        return Attribute::make(
            get: fn (): string => $this->type->accountingType(),
        );
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'type' => AccountType::class,
        ];
    }
}
