<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToUser;
use Database\Factories\ReceivableFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property-read int $id
 * @property int $user_id
 * @property int $contact_id
 * @property int $currency_id
 * @property int|null $series_id
 * @property float $amount_total
 * @property float $amount_paid
 * @property string $status
 * @property string|null $description
 * @property \Carbon\Carbon $due_date
 * @property int|null $origin_transaction_id
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read Contact $contact
 * @property-read Currency $currency
 * @property-read ReceivableSeries|null $series
 * @property-read Transaction|null $originTransaction
 * @property-read \Illuminate\Database\Eloquent\Collection<int, ReceivablePayment> $payments
 */
final class Receivable extends Model
{
    /**
     * @use BelongsToUser<Receivable>
     */
    use BelongsToUser;

    /** @use HasFactory<ReceivableFactory> */
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
     * @return BelongsTo<ReceivableSeries, $this>
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(ReceivableSeries::class, 'series_id');
    }

    /**
     * @return BelongsTo<Transaction, $this>
     */
    public function originTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'origin_transaction_id');
    }

    /**
     * @return HasMany<ReceivablePayment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(ReceivablePayment::class);
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
            'series_id' => 'integer',
            'amount_total' => 'float',
            'amount_paid' => 'float',
            'status' => 'string',
            'description' => 'string',
            'due_date' => 'date',
            'origin_transaction_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
