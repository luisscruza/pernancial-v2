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
        return 'Lista categorias de transaccion del usuario, con filtro por tipo cuando sea necesario.';
    }

    public function handle(Request $request): Stringable|string
    {
        $type = mb_strtolower($this->strip((string) ($request['type'] ?? '')));

        if ($type !== '' && ! in_array($type, [CategoryType::INCOME->value, CategoryType::EXPENSE->value], true)) {
            return 'Tipo invalido. Usa "income" o "expense".';
        }

        $categories = Category::query()
            ->where('user_id', $this->user->id)
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        if ($categories->isEmpty()) {
            if ($type === '') {
                return 'No se encontraron categorias para este usuario.';
            }

            return sprintf('No se encontraron categorias de tipo %s para este usuario.', $type);
        }

        $lines = ['Categorias:'];

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
                ->description('Filtro opcional de tipo de categoria: income o expense.')
                ->enum([CategoryType::INCOME->value, CategoryType::EXPENSE->value]),
        ];
    }

    private function strip(string $value): string
    {
        return preg_replace('/^\s+|\s+$/u', '', $value) ?? $value;
    }
}
