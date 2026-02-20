<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Models\Account;
use App\Models\User;
use Exception;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
final class GetAccountsTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = <<<'MARKDOWN'
        Retrieve all user accounts with their details including ID, name, type, currency, and current balance.
        Use this tool to show the user their accounts or to get account IDs for creating transactions.
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
            $accounts = Account::where('user_id', $user->id)
                ->with(['currency'])
                ->orderBy('name')
                ->get()
                ->map(fn (Account $account): array => [
                    'id' => $account->id,
                    'name' => $account->name,
                    'type' => $account->type->value,
                    'type_label' => $account->type->name ?? $account->type->value,
                    'currency' => [
                        'id' => $account->currency->id,
                        'code' => $account->currency->code,
                        'name' => $account->currency->name,
                        'symbol' => $account->currency->symbol,
                    ],
                    'balance' => number_format((float) $account->balance, 2),
                    'created_at' => $account->created_at?->toISOString(),
                ]);

            $totalAccounts = $accounts->count();

            // Format as a readable message
            $message = "📊 **Your Accounts** ({$totalAccounts} total)\n\n";

            foreach ($accounts as $account) {
                $message .= "**{$account['name']}** (ID: {$account['id']})\n";
                $message .= "  • Type: {$account['type_label']}\n";
                $message .= "  • Balance: {$account['currency']['symbol']}{$account['balance']} {$account['currency']['code']}\n\n";
            }

            return Response::text($message);
        } catch (Exception $e) {
            return Response::error("Failed to retrieve accounts: {$e->getMessage()}");
        }
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
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
