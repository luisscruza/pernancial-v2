<?php

declare(strict_types=1);

namespace App\Mcp\Resources;

use App\Models\Account;
use App\Models\User;
use Exception;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
final class AccountsResource extends Resource
{
    /**
     * The resource's name.
     */
    protected string $name = 'user-accounts';

    /**
     * The resource's title.
     */
    protected string $title = 'User Accounts';

    /**
     * The resource's description.
     */
    protected string $description = <<<'MARKDOWN'
        List of all user accounts with their basic information including name, type, currency, and current balance.
    MARKDOWN;

    /**
     * The resource's URI.
     */
    protected string $uri = 'pernancial://resources/accounts';

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
            $accounts = Account::where('user_id', $user->id)
                ->with(['currency'])
                ->orderBy('name')
                ->get()
                ->map(function (Account $account) {
                    return [
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
                        'balance' => $account->balance,
                        'created_at' => $account->created_at?->toISOString(),
                        'updated_at' => $account->updated_at?->toISOString(),
                    ];
                });

            $responseData = [
                'accounts' => $accounts,
                'total_accounts' => $accounts->count(),
            ];

            return Response::text(json_encode($responseData, JSON_PRETTY_PRINT));
        } catch (Exception $e) {
            return Response::error("Failed to retrieve accounts: {$e->getMessage()}");
        }
    }
}
