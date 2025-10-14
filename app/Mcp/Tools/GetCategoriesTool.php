<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Exception;
use Illuminate\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
final class GetCategoriesTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = <<<'MARKDOWN'
        Retrieve all user categories with their details including ID, name, type (income/expense), and description.
        Use this tool to show the user their categories or to get category IDs for creating transactions.
    MARKDOWN;

    /**
     * Handle the tool request.
     */
    public function handle(Request $request): Response
    {
        // For now, use hardcoded user until auth is properly set up
        $user = User::where('email', 'cruzmediaorg@gmail.com')->first();

        if (! $user) {
            return Response::error('User not found. Please ensure you are authenticated.');
        }

        try {
            $categories = Category::where('user_id', $user->id)
                ->orderBy('type')
                ->orderBy('name')
                ->get();

            // Group by type
            $incomeCategories = $categories->where('type', CategoryType::INCOME);
            $expenseCategories = $categories->where('type', CategoryType::EXPENSE);

            $message = "📁 **Your Categories**\n\n";

            if ($incomeCategories->isNotEmpty()) {
                $message .= "**💰 Income Categories**\n";
                foreach ($incomeCategories as $category) {
                    $message .= "• {$category->name} (ID: {$category->id})";
                }
                $message .= "\n";
            }

            if ($expenseCategories->isNotEmpty()) {
                $message .= "**💸 Expense Categories**\n";
                foreach ($expenseCategories as $category) {
                    $message .= "• {$category->name} (ID: {$category->id})";
                    $message .= "\n";
                }
            }

            return Response::text($message);
        } catch (Exception $e) {
            return Response::error("Failed to retrieve categories: {$e->getMessage()}");
        }
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        // n8n's MCP client requires explicit properties field, even if empty
        // Adding a dummy optional parameter to ensure compatibility
        return [
            '_dummy' => $schema->string()
                ->description('Not used - this tool requires no parameters'),
        ];
    }
}
