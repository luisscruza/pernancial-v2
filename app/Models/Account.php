<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AccountType;
use App\Traits\BelongsToUser;
use App\Traits\HasUuidRouting;
use Database\Factories\AccountFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

/**
 * @property-read int $id
 * @property string $uuid
 * @property int $user_id
 * @property-read int $currency_id
 * @property-read string $name
 * @property-read string|null $emoji
 * @property-read string|null $color
 * @property-read string|null $description
 * @property-read AccountType $type
 * @property-read float $balance
 * @property-read float $balance_in_base
 * @property-read string $accounting_type
 * @property-read bool $is_active
 * @property-read \Carbon\Carbon|null $created_at
 * @property-read \Carbon\Carbon|null $updated_at
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

    protected $appends = [
        'accounting_type',
        'balance_in_base',
    ];

    #[Scope]
    public static function active(Builder $query): void
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
            get: fn(): float => (float) ($this->currency?->is_base ? $this->balance : $this->balance * $this->currency?->rateForDate(now()->format('Y-m-d'))),
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
            get: fn(): string => $this->type->accountingType(),
        );
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'uuid' => 'string',
            'user_id' => 'integer',
            'currency_id' => 'integer',
            'name' => 'string',
            'emoji' => 'string',
            'color' => 'string',
            'type' => AccountType::class,
            'balance' => 'float',
            'description' => 'string',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
