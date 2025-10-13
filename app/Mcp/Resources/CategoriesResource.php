<?php

declare(strict_types=1);

namespace App\Mcp\Resources;

use App\Models\Category;
use App\Models\User;
use Exception;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
final class CategoriesResource extends Resource
{
    /**
     * The resource's name.
     */
    protected string $name = 'user-categories';

    /**
     * The resource's title.
     */
    protected string $title = 'User Categories';

    /**
     * The resource's description.
     */
    protected string $description = <<<'MARKDOWN'
        List of all user categories with their basic information including name, type, and description.
    MARKDOWN;

    /**
     * The resource's URI.
     */
    protected string $uri = 'pernancial://resources/categories';

    /**
     * The resource's MIME type.
     */
    protected string $mimeType = 'application/json';

    /**
     * Handle the resource request.
     */
    public function handle(Request $request): Response
    {
        $user = User::where('email', 'cruzmediaorg@gmail.com')->first();

        try {
            $categories = Category::where('user_id', $user->id)
                ->orderBy('name')
                ->get()
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'type' => $category->type,
                    'created_at' => $category->created_at?->toISOString(),
                    'updated_at' => $category->updated_at?->toISOString(),
                ]);

            $responseData = [
                'categories' => $categories,
                'total_categories' => $categories->count(),
            ];

            return Response::text(json_encode($responseData, JSON_PRETTY_PRINT));
        } catch (Exception $e) {
            return Response::error("Failed to retrieve categories: {$e->getMessage()}");
        }
    }
}
