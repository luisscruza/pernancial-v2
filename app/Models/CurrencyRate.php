<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToUser;
use Database\Factories\CurrencyRateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property-read int $id
 * @property int $user_id
 * @property int $currency_id
 * @property float $rate
 * @property string $effective_date
 */
final class CurrencyRate extends Model
{
    /** @use BelongsToUser<Currency> */
    use BelongsToUser;

    /** @use HasFactory<CurrencyRateFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Currency, $this>
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * The attributes that should be cast.
     */
    public function casts(): array
    {
        return [
            'user_id' => 'integer',
            'currency_id' => 'integer',
            'rate' => 'float',
            'effective_date' => 'date',
        ];
    }
}
