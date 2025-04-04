<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final class CreateOnboardingCategoriesAction
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Invoke the class instance.
     *
     * @param  array<int, array{name: string, emoji: string}>  $data
     */
    public function handle(User $user, array $data): void
    {
        DB::transaction(function () use ($user, $data): void {
            foreach ($data as $category) {
                $user->categories()->create([
                    'name' => $category['name'],
                    'emoji' => $category['emoji'],
                ]);
            }
        });
    }
}
