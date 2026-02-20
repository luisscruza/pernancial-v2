<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToUser;
use Database\Factories\ContactFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read int $id
 * @property int $user_id
 * @property string $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $notes
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ReceivableSeries> $receivableSeries
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Receivable> $receivables
 * @property-read \Illuminate\Database\Eloquent\Collection<int, PayableSeries> $payableSeries
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Payable> $payables
 */
final class Contact extends Model
{
    /**
     * @use BelongsToUser<Contact>
     */
    use BelongsToUser;

    /** @use HasFactory<ContactFactory> */
    use HasFactory;

    /**
     * @return HasMany<ReceivableSeries, $this>
     */
    public function receivableSeries(): HasMany
    {
        return $this->hasMany(ReceivableSeries::class);
    }

    /**
     * @return HasMany<Receivable, $this>
     */
    public function receivables(): HasMany
    {
        return $this->hasMany(Receivable::class);
    }

    /**
     * @return HasMany<PayableSeries, $this>
     */
    public function payableSeries(): HasMany
    {
        return $this->hasMany(PayableSeries::class);
    }

    /**
     * @return HasMany<Payable, $this>
     */
    public function payables(): HasMany
    {
        return $this->hasMany(Payable::class);
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'user_id' => 'integer',
            'name' => 'string',
            'email' => 'string',
            'phone' => 'string',
            'notes' => 'string',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
