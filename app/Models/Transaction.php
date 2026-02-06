<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TransactionType;
use App\Observers\TransactionObserver;
use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([TransactionObserver::class])]
/**
 * @property-read int $id
 * @property TransactionType $type
 * @property float $amount
 * @property CarbonImmutable $transaction_date
 * @property string|null $description
 * @property int $account_id
 * @property int|null $destination_account_id
 * @property int|null $from_account_id
 * @property int|null $category_id
 * @property float|null $conversion_rate
 * @property float|null $converted_amount
 * @property float|null $running_balance
 * @property bool $ai_assisted
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property int|null $related_transaction_id
 */
final class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Account, $this>
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * @return BelongsTo<Account, $this>
     */
    public function destinationAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'destination_account_id');
    }

    /**
     * @return BelongsTo<Account, $this>
     */
    public function fromAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'from_account_id');
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Transaction, $this>
     */
    public function relatedTransaction(): BelongsTo
    {
        return $this->belongsTo(self::class, 'related_transaction_id');
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'type' => TransactionType::class,
            'amount' => 'float',
            'transaction_date' => 'date',
            'description' => 'string',
            'account_id' => 'integer',
            'destination_account_id' => 'integer',
            'from_account_id' => 'integer',
            'category_id' => 'integer',
            'conversion_rate' => 'float',
            'converted_amount' => 'float',
            'running_balance' => 'float',
            'ai_assisted' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
            'related_transaction_id' => 'integer',
        ];
    }
}
