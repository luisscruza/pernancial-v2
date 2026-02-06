<?php

declare(strict_types=1);

namespace App\Ai\Tools;

use App\Models\Account;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

final class ListFinanceAccountsTool implements Tool
{
    public function __construct(private User $user) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'List the user accounts with IDs, balances, and currency codes.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $includeInactive = (bool) ($request['include_inactive'] ?? false);

        $accounts = Account::query()
            ->where('user_id', $this->user->id)
            ->with('currency')
            ->when(! $includeInactive, fn ($query) => $query->where('is_active', true))
            ->orderBy('name')
            ->get();

        if ($accounts->isEmpty()) {
            return 'No accounts found for this user.';
        }

        $lines = ['Accounts:'];

        foreach ($accounts as $account) {
            $currencyCode = $account->currency->code ?? 'N/A';
            $status = $account->is_active ? 'active' : 'inactive';

            $lines[] = sprintf(
                '- id=%d, name="%s", type=%s, balance=%.2f %s, status=%s',
                $account->id,
                $account->name,
                $account->type->value,
                $account->balance,
                $currencyCode,
                $status,
            );
        }

        return implode("\n", $lines);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'include_inactive' => $schema->boolean()
                ->description('Set true to include inactive accounts.'),
        ];
    }
}
