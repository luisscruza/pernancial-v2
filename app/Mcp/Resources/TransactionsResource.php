<?php

declare(strict_types=1);

namespace App\Mcp\Resources;

use App\Models\Transaction;
use App\Models\User;
use Exception;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Resource;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
final class TransactionsResource extends Resource
{
    /**
     * The resource's name.
     */
    protected string $name = 'user-transactions';

    /**
     * The resource's title.
     */
    protected string $title = 'User Transactions';

    /**
     * The resource's description.
     */
    protected string $description = <<<'MARKDOWN'
        List of recent user transactions with details including amount, type, date, account, and category information.
    MARKDOWN;

    /**
     * The resource's URI.
     */
    protected string $uri = 'pernancial://resources/transactions';

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
            $transactions = Transaction::whereHas('account', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->with(['account.currency', 'category', 'destinationAccount.currency'])
                ->orderBy('transaction_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(50) // Limit to last 50 transactions
                ->get()
                ->map(function (Transaction $transaction) {
                    $data = [
                        'id' => $transaction->id,
                        'type' => $transaction->type,
                        'amount' => $transaction->amount,
                        'transaction_date' => $transaction->transaction_date,
                        'description' => $transaction->description,
                        'account' => [
                            'id' => $transaction->account->id,
                            'name' => $transaction->account->name,
                            'currency' => [
                                'code' => $transaction->account->currency->code,
                                'symbol' => $transaction->account->currency->symbol,
                            ],
                        ],
                        'category' => null,
                        'destination_account' => null,
                        'running_balance' => $transaction->running_balance,
                        'created_at' => $transaction->created_at?->toISOString(),
                    ];

                    if ($transaction->category) {
                        $data['category'] = [
                            'id' => $transaction->category->id,
                            'name' => $transaction->category->name,
                            'type' => $transaction->category->type,
                        ];
                    }

                    if ($transaction->destinationAccount) {
                        $data['destination_account'] = [
                            'id' => $transaction->destinationAccount->id,
                            'name' => $transaction->destinationAccount->name,
                            'currency' => [
                                'code' => $transaction->destinationAccount->currency->code,
                                'symbol' => $transaction->destinationAccount->currency->symbol,
                            ],
                        ];
                    }

                    return $data;
                });

            $responseData = [
                'transactions' => $transactions,
                'total_transactions' => $transactions->count(),
                'date_range' => [
                    'latest' => $transactions->first()['transaction_date'] ?? null,
                    'earliest' => $transactions->last()['transaction_date'] ?? null,
                ],
            ];

            return Response::text(json_encode($responseData, JSON_PRETTY_PRINT));
        } catch (Exception $e) {
            return Response::error("Failed to retrieve transactions: {$e->getMessage()}");
        }
    }
}
