<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CategoryType;
use App\Traits\BelongsToUser;
use App\Traits\HasUuidRouting;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Category extends Model
{
    /** @use BelongsToUser<Category> */
    use BelongsToUser;

    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    /** @use HasUuidRouting<Category> */
    use HasUuidRouting;

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
            'type' => CategoryType::class,
        ];
    }
}
