<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PayablePaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $payable_id
 * @property int $account_id
 * @property int|null $transaction_id
 * @property float $amount
 * @property \Carbon\Carbon $paid_at
 * @property string|null $note
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read Payable $payable
 * @property-read Account $account
 * @property-read Transaction|null $transaction
 */
final class PayablePayment extends Model
{
    /** @use HasFactory<PayablePaymentFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Payable, $this>
     */
    public function payable(): BelongsTo
    {
        return $this->belongsTo(Payable::class);
    }

    /**
     * @return BelongsTo<Account, $this>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * @return BelongsTo<Transaction, $this>
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'payable_id' => 'integer',
            'account_id' => 'integer',
            'transaction_id' => 'integer',
            'amount' => 'float',
            'paid_at' => 'date',
            'note' => 'string',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
