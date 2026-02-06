<?php

declare(strict_types=1);

namespace App\Ai\Tools;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

final class ListFinanceCategoriesTool implements Tool
{
    public function __construct(private User $user) {}

    public function description(): Stringable|string
    {
        return 'List transaction categories for the user, filtered by type when needed.';
    }

    public function handle(Request $request): Stringable|string
    {
        $type = mb_strtolower($this->strip((string) ($request['type'] ?? '')));

        if ($type !== '' && ! in_array($type, [CategoryType::INCOME->value, CategoryType::EXPENSE->value], true)) {
            return 'Invalid type. Use "income" or "expense".';
        }

        $categories = Category::query()
            ->where('user_id', $this->user->id)
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        if ($categories->isEmpty()) {
            if ($type === '') {
                return 'No categories found for this user.';
            }

            return sprintf('No %s categories found for this user.', $type);
        }

        $lines = ['Categories:'];

        foreach ($categories as $category) {
            $lines[] = sprintf(
                '- id=%d, name="%s", type=%s',
                $category->id,
                $category->name,
                $category->type->value,
            );
        }

        return implode("\n", $lines);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()
                ->description('Optional category type filter: income or expense.')
                ->enum([CategoryType::INCOME->value, CategoryType::EXPENSE->value]),
        ];
    }

    private function strip(string $value): string
    {
        return preg_replace('/^\s+|\s+$/u', '', $value) ?? $value;
    }
}
