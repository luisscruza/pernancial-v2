<?php

declare(strict_types=1);

namespace App\Models;

use App\Observers\TransactionSplitObserver;
use Database\Factories\TransactionSplitFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[ObservedBy([TransactionSplitObserver::class])]
/**
 * @property-read int $id
 * @property int $transaction_id
 * @property int|null $category_id
 * @property float $amount
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
final class TransactionSplit extends Model
{
    /** @use HasFactory<TransactionSplitFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Transaction, $this>
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'id' => 'integer',
            'transaction_id' => 'integer',
            'category_id' => 'integer',
            'amount' => 'float',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
