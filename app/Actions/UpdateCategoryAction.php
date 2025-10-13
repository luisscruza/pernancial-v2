<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Category;

final class UpdateCategoryAction
{
    /**
     * Update the given category with the provided data.
     *
     * @param  array{name: string, emoji: string, type: string}  $data
     */
    public function handle(Category $category, array $data): ?Category
    {
        $category->update([
            'name' => $data['name'],
            'emoji' => $data['emoji'],
            'type' => $data['type'],
        ]);

        return $category->fresh();
    }
}
