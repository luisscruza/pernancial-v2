<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Category;
use App\Models\User;

final class CreateCategoryAction
{
    /**
     * Create a new category for the given user.
     *
     * @param  array{name: string, emoji: string, type: string}  $data
     */
    public function handle(User $user, array $data): Category
    {
        return $user->categories()->create([
            'name' => $data['name'],
            'emoji' => $data['emoji'],
            'type' => $data['type'],
        ]);
    }
}
