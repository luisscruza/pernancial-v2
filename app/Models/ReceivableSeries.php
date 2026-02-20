<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToUser;
use Database\Factories\ReceivableSeriesFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read int $id
 * @property int $user_id
 * @property int $contact_id
 * @property int $currency_id
 * @property string $name
 * @property float $default_amount
 * @property bool $is_recurring
 * @property array<string, mixed>|null $recurrence_rule
 * @property \Carbon\Carbon|null $next_due_date
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read Contact $contact
 * @property-read Currency $currency
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Receivable> $receivables
 */
final class ReceivableSeries extends Model
{
    /**
     * @use BelongsToUser<ReceivableSeries>
     */
    use BelongsToUser;

    /** @use HasFactory<ReceivableSeriesFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Contact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * @return BelongsTo<Currency, $this>
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * @return HasMany<Receivable, $this>
     */
    public function receivables(): HasMany
    {
        return $this->hasMany(Receivable::class, 'series_id');
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'user_id' => 'integer',
            'contact_id' => 'integer',
            'currency_id' => 'integer',
            'name' => 'string',
            'default_amount' => 'float',
            'is_recurring' => 'boolean',
            'recurrence_rule' => 'array',
            'next_due_date' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
