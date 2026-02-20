<?php

declare(strict_types=1);

namespace App\Mcp\Tools;

use App\Actions\CreateTransactionAction;
use App\Dto\CreateTransactionDto;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Exception;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;

#[IsIdempotent]
final class CreateTransactionTool extends Tool
{
    /**
     * The tool's description.
     */
    protected string $description = <<<'MARKDOWN'
        Create a financial transaction, such as an expense, income, or transfer between accounts.
        Provide details like amount, date, category, and description. The tool will automatically
        update account balances and handle transfers between accounts.
    MARKDOWN;

    /**
     * Handle the tool request.
     */
    public function handle(Request $request, CreateTransactionAction $createTransactionAction): Response
    {
        $validated = $request->validate([
            'type' => 'required|string|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date_format:Y-m-d',
            'account_id' => 'required|integer|exists:accounts,id',
            'description' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:categories,id',
            'destination_account_id' => 'nullable|integer|exists:accounts,id',
        ], [
            'type.required' => 'Transaction type is required. Use "income", "expense", or "transfer".',
            'type.in' => 'Transaction type must be one of: income, expense, transfer.',
            'amount.required' => 'Transaction amount is required.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount must be greater than 0.',
            'transaction_date.required' => 'Transaction date is required.',
            'transaction_date.date_format' => 'Transaction date must be in YYYY-MM-DD format.',
            'account_id.required' => 'Account ID is required.',
            'account_id.exists' => 'The specified account does not exist.',
            'category_id.exists' => 'The specified category does not exist.',
            'destination_account_id.exists' => 'The specified destination account does not exist.',
        ]);

        $user = User::where('email', 'cruzmediaorg@gmail.com')->first();

        // Verify the account belongs to the authenticated user
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', $user->id)
            ->first();

        if (! $account) {
            return Response::error('Account not found or you do not have permission to access it.');
        }

        $transactionType = TransactionType::from($validated['type']);

        // For transfers, validate destination account
        $destinationAccount = null;
        if ($transactionType === TransactionType::TRANSFER) {
            if (! isset($validated['destination_account_id'])) {
                return Response::error('Destination account is required for transfer transactions.');
            }

            $destinationAccount = Account::where('id', $validated['destination_account_id'])
                ->where('user_id', $user->id)
                ->first();

            if (! $destinationAccount) {
                return Response::error('Destination account not found or you do not have permission to access it.');
            }

            if ($account->id === $destinationAccount->id) {
                return Response::error('Source and destination accounts cannot be the same.');
            }
        }

        // Verify category (required for income/expense, optional for transfer)

        if ($transactionType !== TransactionType::TRANSFER && ! isset($validated['category_id'])) {
            return Response::error('Category is required for income and expense transactions.');
        }

        $category = null;
        if (isset($validated['category_id'])) {
            $category = Category::where('id', $validated['category_id'])
                ->where('user_id', $user->id)
                ->first();

            if (! $category) {
                return Response::error('Category not found or you do not have permission to access it.');
            }
        }

        try {
            $dto = new CreateTransactionDto(
                type: $transactionType,
                amount: $validated['amount'],
                transaction_date: $validated['transaction_date'],
                description: $validated['description'] ?? null,
                destination_account: $destinationAccount,
                category: $category,
                conversion_rate: 1.0, // Default to 1.0 for now
            );

            $createTransactionAction->handle($account, $dto);

            $transactionTypeLabel = $transactionType->label();
            $accountName = $account->name ?? 'Account';
            $amount = number_format($validated['amount'], 2);
            $currency = $account->currency->code ?? '';

            $message = "Successfully created {$transactionTypeLabel} transaction of {$amount} {$currency} for {$accountName}";

            if ($destinationAccount) {
                $destinationName = $destinationAccount->name ?? 'Destination Account';
                $message .= " to {$destinationName}";
            }

            if ($category) {
                $message .= " in category '{$category->name}'";
            }

            $message .= " on {$validated['transaction_date']}.";

            if ($validated['description']) {
                $message .= " Description: {$validated['description']}";
            }

            return Response::text($message);

        } catch (Exception $e) {
            return Response::error("Failed to create transaction: {$e->getMessage()}");
        }
    }

    /**
     * Get the tool's input schema.
     *
     * @return array<string, \Illuminate\JsonSchema\Types\Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()
                ->description('The type of transaction (income, expense, or transfer)')
                ->enum(['income', 'expense', 'transfer'])
                ->required(),
            'amount' => $schema->number()
                ->description('The amount of the transaction (must be greater than 0)')
                ->required(),
            'transaction_date' => $schema->string()
                ->description('The date of the transaction in YYYY-MM-DD format')
                ->required(),
            'account_id' => $schema->string()
                ->description('The ID of the account for the transaction')
                ->required(),
            'description' => $schema->string()
                ->description('A brief description of the transaction'),
            'category_id' => $schema->string()
                ->description('The ID of the category associated with the transaction'),
            'destination_account_id' => $schema->string()
                ->description('The ID of the destination account (required for transfers)'),
        ];
    }
}
