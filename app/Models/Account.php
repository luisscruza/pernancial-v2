<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AccountType;
use App\Traits\BelongsToUser;
use Database\Factories\AccountFactory;
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

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'type' => AccountType::class,
        ];
    }
}
